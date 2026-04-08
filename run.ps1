# MediLocker Unified Startup Script
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$backendPort = 8002
$frontendPort = 5173
$legacyBackendPort = 8000

Write-Host "--- Starting MediLocker System ---" -ForegroundColor Cyan

function Stop-PortProcess {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $connections | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
            Write-Host "Stopping process on port $Port (PID $_)..." -ForegroundColor Yellow
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
    }
}

function Start-ServiceWindow {
    param(
        [string]$Title,
        [string]$WorkingDirectory,
        [string]$Command
    )

    $escapedDirectory = $WorkingDirectory.Replace("'", "''")
    $escapedCommand = $Command.Replace("'", "''")
    $fullCommand = "Set-Location '$escapedDirectory'; `$Host.UI.RawUI.WindowTitle = '$Title'; $escapedCommand"

    Start-Process powershell -WorkingDirectory $WorkingDirectory -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command", $fullCommand
    ) | Out-Null
}

Write-Host "--- Cleaning ports $legacyBackendPort, $backendPort and $frontendPort ---" -ForegroundColor Yellow
Stop-PortProcess -Port $legacyBackendPort
Stop-PortProcess -Port $backendPort
Stop-PortProcess -Port $frontendPort

if (!(Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Host "--- Frontend dependencies missing. Installing... ---" -ForegroundColor Yellow
    Push-Location $frontendDir
    try {
        npm install
    } finally {
        Pop-Location
    }
}

$backendPython = Join-Path $backendDir ".venv\Scripts\python.exe"
if (Test-Path $backendPython) {
    Write-Host "--- Checking backend dependencies ---" -ForegroundColor Yellow
    & $backendPython -c "import boto3, email_validator" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "--- Installing backend dependencies ---" -ForegroundColor Yellow
        Push-Location $backendDir
        try {
            & $backendPython -m pip install -r requirements.txt
        } finally {
            Pop-Location
        }
    }
}

$backendCommand = if (Test-Path $backendPython) {
    ".\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port $backendPort"
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    "python -m uvicorn app.main:app --host 127.0.0.1 --port $backendPort"
} else {
    "uv run uvicorn app.main:app --host 127.0.0.1 --port $backendPort"
}

$frontendCommand = "npm run dev -- --host 127.0.0.1 --port $frontendPort"

Write-Host "--- Launching Backend ---" -ForegroundColor Green
Start-ServiceWindow -Title "MediLocker Backend" -WorkingDirectory $backendDir -Command $backendCommand

Write-Host "--- Launching Frontend ---" -ForegroundColor Magenta
Start-ServiceWindow -Title "MediLocker Frontend" -WorkingDirectory $frontendDir -Command $frontendCommand

Write-Host ""
Write-Host "Backend:  http://127.0.0.1:$backendPort" -ForegroundColor Green
Write-Host "Frontend: http://127.0.0.1:$frontendPort" -ForegroundColor Magenta
Write-Host "API Docs: http://127.0.0.1:$backendPort/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both services were started in separate PowerShell windows." -ForegroundColor White
