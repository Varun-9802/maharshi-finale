$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$web = Join-Path $root "maharshi-main"
$ai = Join-Path $root "maharshi-ai"

if (-not (Test-Path (Join-Path $web ".env.local"))) {
  Copy-Item (Join-Path $web ".env.example") (Join-Path $web ".env.local")
  Write-Host "Created maharshi-main/.env.local. Add your Supabase URL and anon/publishable key before signing in." -ForegroundColor Yellow
}

$aiCommand = @"
Set-Location '$ai'
if (-not (Test-Path 'venv\Scripts\Activate.ps1')) {
  py -3.11 -m venv venv
}
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
"@

$webCommand = @"
Set-Location '$web'
if (-not (Test-Path 'node_modules')) {
  npm install
}
npm run dev
"@

Start-Process powershell -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $aiCommand)
Start-Process powershell -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $webCommand)

Write-Host "Maharshi backend and website terminals opened." -ForegroundColor Green
Write-Host "AI health check: http://127.0.0.1:8000/health"
Write-Host "Website: http://localhost:3000"
