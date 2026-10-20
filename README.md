# CodeGen AI — local fine-tuned model integration

This project contains a React/Vite UI, Express API gateway, and FastAPI inference server. Local Qwen + LoRA is the default generation engine. Demo Mode is optional and must be selected explicitly.

## Point the website to your existing adapter

The ZIP contains an empty `model/` placeholder, not trained weights. Set `LORA_MODEL_DIR` in a root `.env` file to the `model` directory produced by your existing `finetune.py`.

```dotenv
LORA_MODEL_DIR="C:/Users/Sandip Patel/Desktop/Code_Play_Ground_2/play-ground/AI Code Generation System/model"
BASE_MODEL_NAME="Qwen/Qwen2.5-Coder-0.5B-Instruct"
FASTAPI_URL="http://127.0.0.1:8000"
REQUIRE_LORA="1"
AUTOLOAD_MODEL="1"
FORCE_CPU="0"
```

Use forward slashes in Windows paths. The target directory should contain `adapter_config.json` and `adapter_model.safetensors` (or the PEFT adapter weights file). Do not point it at the dataset directory.

## Run on Windows

Open two PowerShell terminals in the website project folder.

### Terminal 1 — Python model API

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

The first startup may download the base model from Hugging Face. If Hugging Face returns a DNS/network error, resolve the connection or pre-cache the model before retrying.

Open `http://127.0.0.1:8000/health`. It must report `"status": "ready"` and `"is_lora_loaded": true`.

### Terminal 2 — website and gateway

```powershell
npm install
Copy-Item .env.example .env
# Edit .env and set LORA_MODEL_DIR to the actual adapter directory.
npm run dev
```

Open the URL printed by the server (normally `http://localhost:3000`).

## Integration behavior

- The backend uses `tokenizer.apply_chat_template(...)` for Qwen's native instruction format.
- PEFT loads the adapter using `PeftModel.from_pretrained(base_model, LORA_MODEL_DIR)`.
- The website defaults to the local model and does not silently use Gemini if the local model is offline.
- Demo Mode is separate and uses Gemini only if you explicitly select it and configure `GEMINI_API_KEY`.
- The included `model/` directory is a placeholder; no model weights are included in this ZIP.
