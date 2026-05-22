$ErrorActionPreference = "Stop"

$workspace = (Resolve-Path ".").Path
$nextPath = Join-Path $workspace ".next"

$projectProcesses = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
  Where-Object {
    $_.CommandLine -like "*7.ResuBee*" -and
    ($_.Name -eq "node.exe" -or $_.Name -like "npm*" -or $_.Name -eq "powershell.exe")
  }

foreach ($process in $projectProcesses) {
  try {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
    Write-Host "Stopped process $($process.ProcessId)"
  } catch {
    Write-Host "Process $($process.ProcessId) already exited"
  }
}

Start-Sleep -Milliseconds 500

if (Test-Path $nextPath) {
  $resolved = (Resolve-Path $nextPath).Path
  if (-not $resolved.StartsWith($workspace)) {
    throw "Refusing to remove path outside workspace: $resolved"
  }
  for ($i = 1; $i -le 5; $i++) {
    try {
      Remove-Item -Recurse -Force -LiteralPath $resolved -ErrorAction Stop
      break
    } catch {
      if ($i -eq 5) { throw }
      Start-Sleep -Seconds 1
    }
  }
  Write-Host "Removed .next cache"
} else {
  Write-Host ".next cache does not exist"
}
