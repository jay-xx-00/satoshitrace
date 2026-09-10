#!/usr/bin/env bash
# ==============================================================================
# SatoshiTrace — 1-Command Offline Launcher for Linux Platform
# Smart India Hackathon (SIH 2026) / Problem Statement ID: SIH26146
# Domain: AI-Powered Monitoring & Analysis of Bitcoin Transaction Traffic
# ==============================================================================

set -e

echo "========================================================================"
echo "  ₿ SatoshiTrace — Bitcoin Forensic Intelligence Command Center"
echo "  Problem Statement ID: SIH26146 | 100% Offline Air-Gapped Linux App"
echo "========================================================================"

# Determine project directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# 1. Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "[!] Error: python3 is not installed or not in PATH."
    exit 1
fi

# 2. Check Node.js / npm
if ! command -v npm &> /dev/null; then
    echo "[!] Error: npm is not installed or not in PATH."
    exit 1
fi

echo "[1/4] Checking Python environment and dependencies..."
# If in virtual environment or Debian PEP 668 environment, handle gracefully
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Install backend dependencies with fallback for PEP 668 managed environments
python3 -m pip install -r satoshitrace/backend/requirements.txt --quiet --no-warn-script-location 2>/dev/null || \
python3 -m pip install -r satoshitrace/backend/requirements.txt --break-system-packages --quiet --no-warn-script-location 2>/dev/null || true

# 3. Check frontend node_modules
if [ ! -d "sato/node_modules" ]; then
    echo "[2/4] Installing frontend dependencies (one-time setup)..."
    cd sato && npm install --prefer-offline --no-audit && cd "$DIR"
fi

# 4. Start FastAPI Backend
echo "[3/4] Starting FastAPI Forensic Intelligence Engine on http://127.0.0.1:8000..."
python3 -m uvicorn satoshitrace.backend.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# 5. Start Frontend
echo "[4/4] Starting SatoshiTrace UI on http://localhost:8080..."
cd sato
npm run dev -- --port 8080 --host &
FRONTEND_PID=$!
cd "$DIR"

# Cleanup on exit
trap "echo ''; echo '[*] Terminating SatoshiTrace forensic servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" SIGINT SIGTERM EXIT

sleep 2

# Open browser if available
echo "[+] Opening forensic dashboard in default browser..."
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:8080" >/dev/null 2>&1 || true
elif command -v google-chrome &> /dev/null; then
    google-chrome "http://localhost:8080" >/dev/null 2>&1 || true
elif command -v firefox &> /dev/null; then
    firefox "http://localhost:8080" >/dev/null 2>&1 || true
fi

echo "========================================================================"
echo "  ✅ SatoshiTrace is LIVE and operational:"
echo "  • Web Interface:    http://localhost:8080"
echo "  • Forensic Engine:  http://127.0.0.1:8000"
echo "  • API Docs (Docs):  http://127.0.0.1:8000/docs"
echo "  • Press CTRL+C in this terminal to safely stop all services."
echo "========================================================================"

wait
