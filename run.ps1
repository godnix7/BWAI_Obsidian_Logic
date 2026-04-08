# MediLocker Unified Startup Script
Write-Host "--- Starting MediLocker System ---" -ForegroundColor Cyan

# 1. Clear ports 8000 (Backend) and 5173 (Frontend)
Write-Host "--- Cleaning up ports ---" -ForegroundColor Yellow
$ports = 8000, 5173
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Killing process on port $port..." -ForegroundColor Red
        Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

# 2. Start Backend
Write-Host "--- Launching Backend (FastAPI) on 127.0.0.1 ---" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# 3. Start Frontend
Write-Host "--- Launching Frontend (Vite) ---" -ForegroundColor Magenta
cd frontend
if (!(Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}
npm run dev
