# aka-graph-init — Windows launcher (native Node, no Git Bash / WSL)
param(
    [switch]$WithGraphify,
    [string]$Alias = "",
    [switch]$SkipHusky,
    [switch]$SkipMcp,
    [switch]$Quiet
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$setupMjs = Join-Path $scriptDir "setup.mjs"

if (-not (Test-Path $setupMjs)) {
    Write-Error "setup.mjs not found next to setup.ps1"
    exit 1
}

if (-not $env:AKAKIT_TARGET_DIR) {
    if (Test-Path (Join-Path (Get-Location) ".cursor")) {
        $env:AKAKIT_TARGET_DIR = (Join-Path (Get-Location) ".cursor")
    } elseif (Test-Path (Join-Path $env:USERPROFILE ".cursor")) {
        $env:AKAKIT_TARGET_DIR = Join-Path $env:USERPROFILE ".cursor"
    }
}

$nodeArgs = @($setupMjs)
if ($WithGraphify) { $nodeArgs += "--with-graphify" }
if ($Alias) { $nodeArgs += "--alias"; $nodeArgs += $Alias }
if ($SkipHusky) { $nodeArgs += "--skip-husky" }
if ($SkipMcp) { $nodeArgs += "--skip-mcp" }
if ($Quiet) { $nodeArgs += "--quiet" }

& node @nodeArgs
exit $LASTEXITCODE
