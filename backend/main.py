"""
CodeGen AI FastAPI inference service. Loads Qwen and the user's existing PEFT/LoRA adapter.
Set LORA_MODEL_DIR in .env to the adapter folder created by finetune.py.
"""
from __future__ import annotations
import os, re, time
from pathlib import Path
from threading import Lock
from typing import Literal
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

APP_DIR = Path(__file__).resolve().parent
PROJECT_DIR = APP_DIR.parent
from dotenv import load_dotenv

load_dotenv(PROJECT_DIR / ".env")
BASE_MODEL_NAME = os.getenv("BASE_MODEL_NAME", "Qwen/Qwen2.5-Coder-0.5B-Instruct")
_raw_adapter_dir = os.getenv("LORA_MODEL_DIR", str(PROJECT_DIR / "model"))
LORA_MODEL_DIR = Path(_raw_adapter_dir).expanduser()
if not LORA_MODEL_DIR.is_absolute():
    LORA_MODEL_DIR = (PROJECT_DIR / LORA_MODEL_DIR).resolve()
FORCE_CPU = os.getenv("FORCE_CPU", "0") == "1"
DEVICE = "cpu" if FORCE_CPU or not torch.cuda.is_available() else "cuda"
REQUIRE_LORA = os.getenv("REQUIRE_LORA", "1") == "1"

app = FastAPI(title="CodeGen AI Backend", description="Local Qwen + PEFT/LoRA inference API", version="1.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False, allow_methods=["GET", "POST", "OPTIONS"], allow_headers=["*"],
)
model = None
tokenizer = None
model_load_status = "unloaded"
model_load_error: str | None = None
is_lora_active = False
_load_lock = Lock()

def load_ai_model() -> None:
    global model, tokenizer, model_load_status, model_load_error, is_lora_active
    if model is not None:
        return
    with _load_lock:
        if model is not None:
            return
        model_load_status, model_load_error = "loading", None
        try:
            from transformers import AutoModelForCausalLM, AutoTokenizer
            from peft import PeftModel
            adapter_config = LORA_MODEL_DIR / "adapter_config.json"
            if REQUIRE_LORA and not adapter_config.is_file():
                raise FileNotFoundError(
                    f"LoRA adapter not found at {LORA_MODEL_DIR}. Set LORA_MODEL_DIR in .env "
                    "to the folder containing adapter_config.json and the PEFT adapter weights."
                )
            print(f"[CodeGen AI] Base model: {BASE_MODEL_NAME}; device: {DEVICE}; adapter: {LORA_MODEL_DIR}")
            loaded_tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_NAME)
            if loaded_tokenizer.pad_token_id is None:
                loaded_tokenizer.pad_token = loaded_tokenizer.eos_token
            dtype = torch.float16 if DEVICE == "cuda" else torch.float32
            base_model = AutoModelForCausalLM.from_pretrained(
                BASE_MODEL_NAME, torch_dtype=dtype, low_cpu_mem_usage=True
            ).to(DEVICE)
            if adapter_config.is_file():
                loaded_model = PeftModel.from_pretrained(base_model, str(LORA_MODEL_DIR))
                is_lora_active = True
            else:
                loaded_model, is_lora_active = base_model, False
            loaded_model.eval()
            model, tokenizer, model_load_status = loaded_model, loaded_tokenizer, "ready"
            print("[CodeGen AI] Model loaded successfully.")
        except Exception as exc:
            model_load_error = f"{type(exc).__name__}: {exc}"
            model_load_status = "error"
            print(f"[CodeGen AI] Model loading failed: {model_load_error}")

class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=12000)
    language: Literal["Python", "JavaScript", "Java", "C++", "C"] = "Python"
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)
    max_tokens: int = Field(default=512, ge=16, le=2048)
    top_p: float = Field(default=0.9, gt=0.0, le=1.0)

class GenerateResponse(BaseModel):
    code: str
    language: str
    duration_ms: int
    is_lora: bool
    model: str

def clean_generated_code(raw_output: str) -> str:
    raw_output = raw_output.strip()
    match = re.search(r"```(?:[a-zA-Z0-9_+#.-]+)?\s*\n([\s\S]*?)```", raw_output)
    return match.group(1).strip() if match else raw_output

@app.on_event("startup")
async def startup_event():
    if os.getenv("AUTOLOAD_MODEL", "1") == "1":
        load_ai_model()

@app.get("/health")
def health():
    return {
        "status": model_load_status, "model": BASE_MODEL_NAME,
        "lora": str(LORA_MODEL_DIR) if is_lora_active else None,
        "is_lora_loaded": is_lora_active, "require_lora": REQUIRE_LORA,
        "device": DEVICE, "adapter_path": str(LORA_MODEL_DIR),
        "adapter_found": (LORA_MODEL_DIR / "adapter_config.json").is_file(),
        "error": model_load_error,
    }

@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    global model, tokenizer
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    if model is None or model_load_status != "ready":
        load_ai_model()
    if model is None or tokenizer is None or model_load_status != "ready":
        raise HTTPException(status_code=503, detail=model_load_error or "Model is not ready. Check GET /health.")
    started = time.time()
    messages = [
        {"role": "system", "content": f"You are an expert {req.language} software engineer. Generate clean, functional {req.language} code. Return code directly without a conversational preamble."},
        {"role": "user", "content": f"{req.prompt.strip()}\nTarget language: {req.language}"},
    ]
    try:
        # Use Qwen's tokenizer chat template, matching the native Instruct format.
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        inputs = {k: v.to(DEVICE) for k, v in tokenizer(text, return_tensors="pt").items()}
        gen_args = {
            "max_new_tokens": req.max_tokens, "do_sample": req.temperature > 0,
            "repetition_penalty": 1.05, "pad_token_id": tokenizer.pad_token_id or tokenizer.eos_token_id,
            "eos_token_id": tokenizer.eos_token_id,
        }
        if req.temperature > 0:
            gen_args.update(temperature=req.temperature, top_p=req.top_p)
        with torch.inference_mode():
            output = model.generate(**inputs, **gen_args)
        new_tokens = output[0, inputs["input_ids"].shape[-1]:]
        code = clean_generated_code(tokenizer.decode(new_tokens, skip_special_tokens=True))
        if not code:
            raise RuntimeError("The model returned an empty response. Try a more specific prompt.")
        return GenerateResponse(code=code, language=req.language, duration_ms=int((time.time()-started)*1000),
                               is_lora=is_lora_active, model=f"{BASE_MODEL_NAME} + LoRA" if is_lora_active else BASE_MODEL_NAME)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference failure: {type(exc).__name__}: {exc}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
