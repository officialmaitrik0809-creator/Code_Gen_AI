#!/usr/bin/env bash
# Script to launch CodeGen AI FastAPI Backend
set -e

echo "Starting CodeGen AI FastAPI Backend..."
python3 -m venv venv || true
source venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
