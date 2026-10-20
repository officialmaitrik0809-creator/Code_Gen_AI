# Model adapter directory

This folder is only a placeholder; this ZIP does not contain trained weights.

The backend reads `LORA_MODEL_DIR` from the root `.env`. Point it to the folder created by your existing `finetune.py`, containing `adapter_config.json` and the PEFT adapter weights.

Example:
`LORA_MODEL_DIR="C:/Users/Sandip Patel/Desktop/Code_Play_Ground_2/play-ground/AI Code Generation System/model"`

The base model is loaded separately from `BASE_MODEL_NAME`; the adapter folder is not a standalone model.
