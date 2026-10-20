"""
CodeGen AI - Fine-Tuning Script
Fine-tunes Qwen/Qwen2.5-Coder-0.5B-Instruct on the sahil2801/CodeAlpaca-20k dataset
using Hugging Face Transformers, PyTorch, and PEFT (LoRA).
"""

import os
import argparse
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForSeq2Seq
)
from peft import (
    LoraConfig,
    get_peft_model,
    TaskType
)

def parse_args():
    parser = argparse.ArgumentParser(description="Fine-tune Qwen2.5-Coder with LoRA on CodeAlpaca")
    parser.add_argument("--base_model", type=str, default="Qwen/Qwen2.5-Coder-0.5B-Instruct")
    parser.add_argument("--dataset_name", type=str, default="sahil2801/CodeAlpaca-20k")
    parser.add_argument("--output_dir", type=str, default="./model")
    parser.add_argument("--num_epochs", type=int, default=3)
    parser.add_argument("--batch_size", type=int, default=4)
    parser.add_argument("--grad_accum", type=int, default=8)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--lora_r", type=int, default=16)
    parser.add_argument("--lora_alpha", type=int, default=32)
    parser.add_argument("--lora_dropout", type=float, default=0.05)
    parser.add_argument("--max_seq_length", type=int, default=1024)
    return parser.parse_args()

def format_instruction(sample):
    """Formats CodeAlpaca sample into ChatML prompt-response pairs."""
    instruction = sample.get("instruction", "")
    input_text = sample.get("input", "")
    output_text = sample.get("output", "")

    user_content = instruction
    if input_text and len(input_text.strip()) > 0:
        user_content += f"\n\nInput Context:\n{input_text}"

    prompt = (
        f"<|im_start|>system\nYou are an expert code generator. "
        f"Generate only clean, functional, and optimal code.<|im_end|>\n"
        f"<|im_start|>user\n{user_content}<|im_end|>\n"
        f"<|im_start|>assistant\n{output_text}<|im_end|>"
    )
    return prompt

def main():
    args = parse_args()
    print("=" * 60)
    print("CodeGen AI - LoRA Fine-Tuning Pipeline")
    print(f"Base Model: {args.base_model}")
    print(f"Dataset:    {args.dataset_name}")
    print(f"Output Dir: {args.output_dir}")
    print("=" * 60)

    # 1. Load Tokenizer
    tokenizer = AutoTokenizer.from_pretrained(args.base_model, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # 2. Load Dataset
    print(f"Loading dataset: {args.dataset_name}...")
    dataset = load_dataset(args.dataset_name, split="train")

    def preprocess_function(examples):
        prompts = [format_instruction({"instruction": inst, "input": inp, "output": out})
                   for inst, inp, out in zip(examples["instruction"], examples["input"], examples["output"])]
        tokens = tokenizer(
            prompts,
            truncation=True,
            max_length=args.max_seq_length,
            padding=False,
            return_tensors=None
        )
        tokens["labels"] = tokens["input_ids"].copy()
        return tokens

    tokenized_dataset = dataset.map(
        preprocess_function,
        batched=True,
        remove_columns=dataset.column_names,
        desc="Tokenizing CodeAlpaca dataset"
    )

    # 3. Load Base Model in FP16 / BF16
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Loading base model onto: {device}...")
    model = AutoModelForCausalLM.from_pretrained(
        args.base_model,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        trust_remote_code=True
    )

    # 4. Configure LoRA / PEFT
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        lora_dropout=args.lora_dropout,
        bias="none",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # 5. Training Arguments
    training_args = TrainingArguments(
        output_dir=args.output_dir,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        learning_rate=args.lr,
        logging_steps=10,
        num_train_epochs=args.num_epochs,
        save_strategy="epoch",
        fp16=device == "cuda",
        optim="adamw_torch",
        warmup_ratio=0.03,
        report_to="none"
    )

    # 6. Data Collator and Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        data_collator=DataCollatorForSeq2Seq(tokenizer, pad_to_multiple_of=8, return_tensors="pt")
    )

    print("Beginning training...")
    trainer.train()

    # 7. Save PEFT LoRA adapter
    os.makedirs(args.output_dir, exist_ok=True)
    model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print(f"\n[CodeGen AI] LoRA adapter successfully saved to {args.output_dir}!")

if __name__ == "__main__":
    main()
