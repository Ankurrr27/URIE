$ErrorActionPreference = "Stop"

powershell -NoProfile -ExecutionPolicy Bypass -File scripts/clean-next.ps1

$env:NEXT_TELEMETRY_DISABLED = "1"
npm run dev
