# Design of the site, chosen in start.bat then P: the DC Scaffold design, a blank site, or the DC Scaffold design
# taken out of the project for good, to start your own design from zero.
#   .\design.ps1 -Choice on | off | remove
param([ValidateSet('', 'on', 'off', 'remove')][string]$Choice = '')
$ErrorActionPreference = [System.Management.Automation.ActionPreference]::Stop
$AppDir = Split-Path -Parent $PSScriptRoot
. (Join-Path (Split-Path -Parent $AppDir) 'scripts\common.ps1')

$Config = Join-Path $AppDir 'dc-scaffold.config.js'
if (-not (Test-Path $Config)) { Write-Info 'The DC Scaffold design is no longer in this project: the site is yours.'; exit 0 }
$Text = [IO.File]::ReadAllText($Config)
$IsOn = $Text -notmatch '(?m)^\s*design\s*:\s*false\b'

if (-not $Choice) {
    Write-Box @('Design of the site', $(if ($IsOn) { 'Now: the DC Scaffold design' } else { 'Now: a blank site' }))
    Write-Host ''
    Write-MenuItem '1' 'DC Scaffold design' 'Dark theme, its font, the loader and the welcome page'
    Write-MenuItem '2' 'Blank site' 'A simple style to make your own design; the DC Scaffold design stays aside (choice 1 brings it back)'
    Write-MenuItem '3' 'Start from zero' 'Takes the DC Scaffold design out of the project for good (folder, logo, switch)'
    Write-Host ''
    $Choice = switch (Read-Default 'Choice' '') { '1' { 'on' } '2' { 'off' } '3' { 'remove' } default { '' } }
    if (-not $Choice) { exit 0 }
}

# The switch: dc-scaffold.config.js, read by scripts/design.mjs before every "npm run dev" and build
function Set-Design([bool]$On) {
    $value = if ($On) { 'true' } else { 'false' }
    [IO.File]::WriteAllText($Config, ($Text -replace '(?m)^(\s*design\s*:\s*)(true|false)\b', "`${1}$value"), [Text.UTF8Encoding]::new($false))
    Invoke-In $AppDir { node scripts/design.mjs } | Out-Null
}

if ($Choice -eq 'on' -or $Choice -eq 'off') {
    Set-Design ($Choice -eq 'on')
    Write-Ok $(if ($Choice -eq 'on') { 'DC Scaffold design on.' } else { 'Blank site: your design starts in {{DESIGN_CSS_DIR}}.' })
    Write-Info 'Start the site again to see it (start.bat then D).'
    exit 0
}

# Start from zero: the site keeps working, without anything of DC Scaffold
if (-not (Read-YesNo 'Take the DC Scaffold design out of the project for good?' $false)) { Write-Info 'Nothing changed.'; exit 0 }
Set-Design $false
# The two files written by design.mjs stay, with the blank site in them: they become files of the site, kept by Git
$Ignore = Join-Path (Split-Path -Parent $AppDir) '.gitignore'
if (Test-Path $Ignore) {
    $Kept = Get-Content $Ignore | Where-Object { $_ -notin 'frontend/{{DESIGN_JS}}', 'frontend/{{DESIGN_CSS}}', 'frontend/{{DESIGN_TEXTS_JS}}' -and $_ -notmatch '^# Written by frontend/scripts/design\.mjs' }
    [IO.File]::WriteAllLines($Ignore, [string[]]$Kept, [Text.UTF8Encoding]::new($false))
}
foreach ($File in '{{DESIGN_JS}}', '{{DESIGN_CSS}}') {
    $Full = Join-Path $AppDir $File
    # Their first line said "written by scripts/design.mjs": no longer true
    if (Test-Path $Full) { [IO.File]::WriteAllLines($Full, [string[]](Get-Content $Full | Select-Object -Skip 1), [Text.UTF8Encoding]::new($false)) }
}
foreach ($Path in '{{DESIGN_FOLDER}}', 'public/dc-scaffold', 'static/dc-scaffold', 'dc-scaffold.config.js', 'scripts/design.mjs') {
    $Full = Join-Path $AppDir $Path
    if (Test-Path $Full) { Remove-Item -LiteralPath $Full -Recurse -Force }
}
# The "pre" scripts of package.json that ran design.mjs
$Package = Get-Content (Join-Path $AppDir 'package.json') -Raw | ConvertFrom-Json
$Names = @($Package.scripts.PSObject.Properties | Where-Object { $_.Value -eq 'node scripts/design.mjs' } | ForEach-Object { "scripts.$($_.Name)" })
if ($Names.Count) { Invoke-In $AppDir { npm pkg delete @Names } | Out-Null }
Write-Ok 'The DC Scaffold design is out of the project: the site is a blank site, yours to design ({{DESIGN_CSS_DIR}}).'
Write-Info 'This script is no longer needed: delete it if you like (frontend/scripts/design.ps1).'
