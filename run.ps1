# ==============================================================================
# SatoshiTrace — 1-Command Offline Launcher for Windows Platform
# Smart India Hackathon (SIH 2026) / National Cyber Crime Forensic Submission
# ==============================================================================

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  SatoshiTrace — Bitcoin Forensic Intelligence Command Center" -ForegroundColor Cyan
Write-Host "  Status: 100% Offline-Ready Platform" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Python Backend
Write-Host "[1/3] Starting FastAPI Forensic Intelligence Engine on http://127.0.0.1:8000..." -ForegroundColor Yellow
$BackendProc = Start-Process python -ArgumentList "-m", "uvicorn", "satoshitrace.backend.main:app", "--host", "127.0.0.1", "--port", "8000" -WorkingDirectory $ScriptDir -PassThru

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
Write-Host "  • Press Enter to shutdown servers..." -ForegroundColor Gray
Write-Host "========================================================================" -ForegroundColor Cyan

Read-Host

Write-Host "Shutting down servers..." -ForegroundColor Yellow
Stop-Process -Id $BackendProc.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $FrontendProc.Id -Force -ErrorAction SilentlyContinue
Write-Host "Servers terminated." -ForegroundColor Green
