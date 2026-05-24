# aka-graph-init — Windows launcher (uses Git Bash, not WSL)
param(
    [switch]$WithGraphify,
    [string]$Alias = "",
    [switch]$SkipHusky,
    [switch]$SkipMcp,
    [switch]$Quiet
)

$ErrorActionPreference = "Stop"

$gitBash = @(
    "${env:ProgramFiles}\Git\bin\bash.exe",
    "${env:ProgramFiles(x86)}\Git\bin\bash.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $gitBash) {
    Write-Error "Git Bash not found. Install Git for Windows: https://git-scm.com/download/win"
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$setupSh = Join-Path $scriptDir "setup.sh"

$args = @()
if ($WithGraphify) { $args += "--with-graphify" }
if ($Alias) { $args += "--alias"; $args += $Alias }
if ($SkipHusky) { $args += "--skip-husky" }
if ($SkipMcp) { $args += "--skip-mcp" }
if ($Quiet) { $args += "--quiet" }

if ($env:AKAKIT_TARGET_DIR) {
    $env:AKAKIT_TARGET_DIR = $env:AKAKIT_TARGET_DIR
} elseif (Test-Path (Join-Path (Get-Location) ".cursor")) {
    $env:AKAKIT_TARGET_DIR = (Join-Path (Get-Location) ".cursor")
} elseif (Test-Path (Join-Path $env:USERPROFILE ".cursor")) {
    $env:AKAKIT_TARGET_DIR = Join-Path $env:USERPROFILE ".cursor"
}

& $gitBash $setupSh @args
exit $LASTEXITCODE
