#!/bin/bash
# Port 8000-dəki prosesi öldürmək üçün script

PORT=${1:-8000}

echo "Port $PORT-dəki prosesləri axtarır..."
PIDS=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "✅ Port $PORT boşdur"
else
    echo "Tapıldı: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null
    sleep 1
    if lsof -ti:$PORT >/dev/null 2>&1; then
        echo "❌ Proses hələ də işləyir"
    else
        echo "✅ Port $PORT boşaldı"
    fi
fi

