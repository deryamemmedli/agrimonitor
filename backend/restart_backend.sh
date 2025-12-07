#!/bin/bash
# Backend-i yenidən başlatmaq üçün script

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Backend proseslərini dayandırır..."
pkill -f uvicorn
sleep 2

echo "Port 8000-i boşaldır..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 1

echo "Backend-i başladır..."
cd "$SCRIPT_DIR"

# Activate virtual environment
source venv/bin/activate

# Ensure PYTHONPATH includes the backend directory
export PYTHONPATH="$SCRIPT_DIR:$PYTHONPATH"

# Start uvicorn
echo "Starting uvicorn from: $(pwd)"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
