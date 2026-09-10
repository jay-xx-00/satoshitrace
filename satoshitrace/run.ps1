# SatoshiTrace Launcher (Subdirectory redirect to root launcher)
$RootDir = Split-Path -Parent $PSScriptRoot
Set-Location $RootDir
& "$RootDir\run.ps1"
