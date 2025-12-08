#!/bin/bash
# Start the backend server with venv

cd "$(dirname "$0")/.." || exit
source venv/bin/activate
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

