# ==============================================================================
# SatoshiTrace — 1-Command Offline Launcher for Windows Platform
# Smart India Hackathon (SIH 2026) / National Cyber Crime Forensic Submission
# ==============================================================================

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  SatoshiTrace — Bitcoin Forensic Intelligence Command Center" -ForegroundColor Cyan
Write-Host "  Status: 100% Offline-Ready Platform" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 0. Start Local Ollama LLM (if installed)
if (Get-Command ollama -ErrorAction SilentlyContinue) {
    $OllamaListening = Get-NetTCPConnection -State Listen -LocalPort 11434 -ErrorAction SilentlyContinue
    if (-not $OllamaListening) {
        Write-Host "[0/3] Starting local Ollama LLM engine on http://127.0.0.1:11434..." -ForegroundColor Cyan
        Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    } else {
        Write-Host "[0/3] Ollama local LLM engine is active on http://127.0.0.1:11434" -ForegroundColor Green
    }
}

# 1. Start Python Backend
Write-Host "[1/3] Starting FastAPI Forensic Intelligence Engine on http://127.0.0.1:8000..." -ForegroundColor Yellow
$PythonCmd = if (Get-Command py -ErrorAction SilentlyContinue) { "py" } else { "python" }
$BackendProc = Start-Process $PythonCmd -ArgumentList "-m", "uvicorn", "satoshitrace.backend.main:app", "--host", "127.0.0.1", "--port", "8000" -WorkingDirectory $ScriptDir -PassThru

# 2. Start Lovable Frontend
Write-Host "[2/3] Starting SatoshiTrace UI on http://localhost:8080..." -ForegroundColor Yellow
$FrontendDir = Join-Path $ScriptDir "sato"
$FrontendProc = Start-Process npm -ArgumentList "run", "dev", "--", "--port", "8080", "--host" -WorkingDirectory $FrontendDir -PassThru

Start-Sleep -Seconds 3

# 3. Open Browser
Write-Host "[3/3] Opening SatoshiTrace in default browser..." -ForegroundColor Green
Start-Process "http://localhost:8080"

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  SatoshiTrace is LIVE and operational:" -ForegroundColor Green
Write-Host "  • Web Interface:   http://localhost:8080" -ForegroundColor White
Write-Host "  • Backend API:     http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  • Ollama LLM:      http://127.0.0.1:11434" -ForegroundColor White
Write-Host "  • Press Enter to shutdown servers..." -ForegroundColor Gray
Write-Host "========================================================================" -ForegroundColor Cyan

Read-Host

Write-Host "Shutting down servers..." -ForegroundColor Yellow
Stop-Process -Id $BackendProc.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $FrontendProc.Id -Force -ErrorAction SilentlyContinue
Write-Host "Servers terminated." -ForegroundColor Green
