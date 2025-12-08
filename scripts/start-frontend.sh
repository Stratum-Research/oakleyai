#!/bin/bash
# Start the frontend server

cd "$(dirname "$0")/.." || exit
cd frontend
npm run dev

