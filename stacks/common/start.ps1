# Launcher for {{PROJECT_NAME}} ({{STACK_LABEL}})
# Usage: start.bat (menu) or .\start.ps1 -Action D|S|R|I|G|B|A|Q|K|O
# Every option adapts to what the project contains (docker-compose.yml, backend/, frontend/).
param([string]$Action)

$Root = $PSScriptRoot
. (Join-Path $Root 'scripts\common.ps1')

$Shell = if (Test-Command 'pwsh') { 'pwsh' } else { 'powershell' }
$ApiDir = Join-Path $Root 'backend'
$AppDir = Join-Path $Root 'frontend'
$HasDocker = Test-Path (Join-Path $Root 'docker-compose.yml')
# Database and files sent from the site, kept by the backups (scripts/data.ps1)
. (Join-Path $Root 'scripts\data.ps1')
$Data = Get-ProjectData $Root
$HasData = [bool]($Data.MySql -or $Data.Sqlite.Count -or $Data.Uploads)

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
# Production of the front: "generate" (static site, Nuxt with a separate API or none) or "build".
# Only one of them is offered: the one that fits the project.
$FrontGenerate = $AppScripts.ContainsKey('generate:prod')
$FrontBuild = if ($FrontGenerate) { $null } elseif ($AppScripts.ContainsKey('build:prod')) { 'build:prod' } elseif ($AppScripts.ContainsKey('build')) { 'build' } else { $null }
# The front builds a Node.js server with the API inside (Nuxt + Nitro), otherwise a static site to upload
$FrontServer = '{{FRONT_SERVER}}' -eq 'true'
# Site without build (HTML / CSS / JS): only its sitemap.xml and robots.txt to write before uploading it
$FrontSitemap = -not $FrontGenerate -and -not $FrontBuild -and (Test-Path (Join-Path $AppDir 'scripts\sitemap.mjs'))
# Qualif: the site shown to the client before it goes online, built with .env.preprod (scripts/qualif.ps1)
$HasQualif = $AppScripts.ContainsKey('generate:qualif') -or $AppScripts.ContainsKey('build:qualif') -or (Test-Path (Join-Path $AppDir 'scripts\qualif.mjs'))

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
    if ($HasData) {
        Write-MenuItem 'K' 'Backup' 'Database and files sent, into backups/'
        Write-MenuItem 'O' 'Restore' 'Put back a backup of backups/'
    }
    Write-Host ''
    if ($FrontGenerate) { Write-MenuItem 'G' 'Generate' 'Static site to upload (frontend/.output/public), with .env.production' }
    if ($FrontBuild -and $FrontServer) { Write-MenuItem 'B' 'Build' 'Site + API in one Node.js server (then npm start, see the steps below)' }
    elseif ($FrontBuild) { Write-MenuItem 'B' 'Build front' 'Static site to upload, with .env.production' }
    elseif ($FrontSitemap) { Write-MenuItem 'B' 'Sitemap' 'sitemap.xml and robots.txt of production (.env.production), then upload frontend/' }
    if ($ApiScripts.ContainsKey('build')) { Write-MenuItem 'A' 'Build API' 'npm run build (backend/)' }
    if ($HasQualif) { Write-MenuItem 'Q' 'Qualif' 'Site shown to the client before going online, into qualif/ (.env.preprod)' }
    if ($FrontGenerate -or $FrontBuild -or $FrontSitemap -or $ApiScripts.ContainsKey('build') -or $HasQualif) { Write-Host '' }
    # How to put this project online (filled by DC Scaffold for the chosen front and back end)
    Write-Host '  {{DEPLOY_TITLE}}' -ForegroundColor DarkGray
{{DEPLOY_LINES}}
    Write-Host ''
    $Action = Read-Default 'Choice' ''
}

switch ($Action.ToUpper()) {
    'D' { Start-Dev }
    'S' { if ($HasDocker) { Invoke-In $Root { docker compose down } | Out-Null } }
    'R' { if ($HasDocker) { Invoke-In $Root { docker compose build --no-cache } | Out-Null } }
    'I' { if (Install-Dependencies -All) { exit 0 } else { exit 1 } }
    'G' { if ($FrontGenerate) { Start-Window $AppDir 'Front generate (production)' 'npm run generate:prod' } }
    'B' {
        if ($FrontBuild) { Start-Window $AppDir 'Front build (production)' "npm run $FrontBuild" }
        elseif ($FrontSitemap) { Invoke-In $AppDir { node scripts/sitemap.mjs . --pages pages --pages-only } | Out-Null }
    }
    'A' { Start-Window $ApiDir 'API build (production)' 'npm run build' }
    'Q' { if ($HasQualif) { & (Join-Path $Root 'scripts\qualif.ps1') -AppDir $AppDir -ApiDir $ApiDir } }
    'K' { if ($HasData) { & (Join-Path $Root 'scripts\backup.ps1') } }
    'O' { if ($HasData) { & (Join-Path $Root 'scripts\restore.ps1') } }
    default { Write-Fail 'Invalid choice.' }
}
