# Launcher for {{PROJECT_NAME}} ({{STACK_LABEL}})
# Usage: start.bat (menu) or .\start.ps1 -Action D|S|R|I|G|B|A
# Every option adapts to what the project contains (docker-compose.yml, backend/, frontend/).
param([string]$Action)

$Root = $PSScriptRoot
. (Join-Path $Root 'scripts\common.ps1')

$Shell = if (Test-Command 'pwsh') { 'pwsh' } else { 'powershell' }
$ApiDir = Join-Path $Root 'backend'
$AppDir = Join-Path $Root 'frontend'
$HasDocker = Test-Path (Join-Path $Root 'docker-compose.yml')

# ---------------------------------------------------------------------------
# Project detection
# ---------------------------------------------------------------------------

# npm scripts of a folder (empty when it has no package.json)
function Get-NpmScripts([string]$Path) {
    $file = Join-Path $Path 'package.json'
    if (-not (Test-Path $file)) { return @{} }
    $scripts = (Get-Content $file -Raw | ConvertFrom-Json).scripts
    $names = @{}
    if ($scripts) { $scripts.PSObject.Properties | ForEach-Object { $names[$_.Name] = $_.Value } }
    return $names
}

$ApiScripts = Get-NpmScripts $ApiDir
$AppScripts = Get-NpmScripts $AppDir
$FrontBuild = if ($AppScripts.ContainsKey('build:prod')) { 'build:prod' } elseif ($AppScripts.ContainsKey('build')) { 'build' } else { $null }

# ---------------------------------------------------------------------------
# Actions
# ---------------------------------------------------------------------------

# Opens a new terminal window running the given command
function Start-Window([string]$Path, [string]$Title, [string]$Command) {
    $safePath = $Path.Replace("'", "''")
    $script = @(
        "`$Host.UI.RawUI.WindowTitle = '$Title'"
        "Set-Location -LiteralPath '$safePath'"
        "Write-Host '  $Title' -ForegroundColor Cyan"
        "Write-Host ''"
        $Command
    ) -join "`n"
    $encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($script))
    Start-Process $Shell -ArgumentList '-NoExit', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', $encoded
}

function Test-Docker {
    docker info *> $null
    return $LASTEXITCODE -eq 0
}

# Installs vendor/ and node_modules/: only the missing ones, or every folder with -All (also applies package.json changes)
function Install-Dependencies([switch]$All) {
    $done = $false
    $ok = $true
    foreach ($dir in $ApiDir, $AppDir) {
        $name = Split-Path $dir -Leaf

        if ((Test-Path (Join-Path $dir 'composer.json')) -and ($All -or -not (Test-Path (Join-Path $dir 'vendor')))) {
            Write-Title "Composer ($name)"
            $installed = Invoke-Composer $dir @('install', '--no-interaction', '--no-progress')
            if (-not $installed) {
                # composer.lock out of date or resolved for another PHP: resolve again from composer.json
                Write-Warn 'The composer.lock file does not match, running composer update...'
                $installed = Invoke-Composer $dir @('update', '--no-interaction', '--no-progress')
            }
            if ($installed) { Write-Ok "Ready: $name/vendor" } else { Write-Fail "Installation failed in $name/ (Composer)"; $ok = $false }
            $done = $true
        }

        if ((Test-Path (Join-Path $dir 'package.json')) -and ($All -or -not (Test-Path (Join-Path $dir 'node_modules')))) {
            Write-Title "npm ($name)"
            $installed = Invoke-In $dir { & $Npm install --no-fund --no-audit }
            if (-not $installed) {
                # Some npm 10 versions crash on recent packages ("edgesOut"): one more try with the latest npm
                Write-Warn 'npm failed, trying again with the latest npm...'
                $installed = Invoke-In $dir { & $Npx --yes npm@latest install --no-fund --no-audit }
            }
            if ($installed) { Write-Ok "Ready: $name/node_modules" } else { Write-Fail "Installation failed in $name/ (npm)"; $ok = $false }
            $done = $true
        }
    }
    if ($All -and -not $done) { Write-Info 'Nothing to install: no package.json or composer.json found.' }
    return $ok
}

function Start-Dev {
    if ($HasDocker -and -not (Test-Docker)) {
        Write-Fail 'Docker is not running. Start Docker Desktop and retry.'
        return
    }
    Install-Dependencies | Out-Null

    if ($HasDocker) { Start-Window $Root 'Docker' 'docker compose up' }
    if ($ApiScripts.ContainsKey('dev')) { Start-Window $ApiDir 'API' 'npm run dev' }
    if ($AppScripts.ContainsKey('dev')) { Start-Window $AppDir 'Front' 'npm run dev' }

    Write-Host ''
    Write-Ok 'Started in separate windows.'
    Write-Host ''
    Write-Box -Color Green @(
{{URL_LINES}}
    )
}

# ---------------------------------------------------------------------------
# Menu
# ---------------------------------------------------------------------------

if (-not $Action) {
    Clear-Host
    Write-Host ''
    Write-Box @(
        '{{PROJECT_NAME_PS}}'
        '{{STACK_LABEL}}'
    )
    Write-Host ''
    Write-MenuItem 'D' 'Development' 'Start everything'
    if ($HasDocker) {
        Write-MenuItem 'S' 'Stop' 'docker compose down'
        Write-MenuItem 'R' 'Rebuild' 'Rebuild Docker images (no cache)'
    }
    Write-MenuItem 'I' 'Install' 'Install / update dependencies (Composer / npm)'
    Write-Host ''
    if ($AppScripts.ContainsKey('generate:prod')) { Write-MenuItem 'G' 'Generate' 'Static front with .env.production' }
    if ($FrontBuild) { Write-MenuItem 'B' 'Build front' "npm run $FrontBuild" }
    if ($ApiScripts.ContainsKey('build')) { Write-MenuItem 'A' 'Build API' 'npm run build (backend/)' }
    if ($FrontBuild -or $ApiScripts.ContainsKey('build')) { Write-Host '' }
    $Action = Read-Default 'Choice' ''
}

switch ($Action.ToUpper()) {
    'D' { Start-Dev }
    'S' { if ($HasDocker) { Invoke-In $Root { docker compose down } | Out-Null } }
    'R' { if ($HasDocker) { Invoke-In $Root { docker compose build --no-cache } | Out-Null } }
    'I' { if (Install-Dependencies -All) { exit 0 } else { exit 1 } }
    'G' { Start-Window $AppDir 'Front generate (production)' 'npm run generate:prod' }
    'B' { if ($FrontBuild) { Start-Window $AppDir 'Front build (production)' "npm run $FrontBuild" } }
    'A' { Start-Window $ApiDir 'API build (production)' 'npm run build' }
    default { Write-Fail 'Invalid choice.' }
}
