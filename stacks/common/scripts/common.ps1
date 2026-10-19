# Helpers shared by start.ps1 and the project generator

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

# npm.cmd / npx.cmd avoid the .ps1 shims, which break some argument lists on Windows
$Npm = if (Get-Command npm.cmd -ErrorAction SilentlyContinue) { 'npm.cmd' } else { 'npm' }
$Npx = if (Get-Command npx.cmd -ErrorAction SilentlyContinue) { 'npx.cmd' } else { 'npx' }

function Test-Command([string]$Command) {
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

# Runs a command inside a folder and reports whether it succeeded
function Invoke-In([string]$Path, [scriptblock]$Command) {
    Push-Location $Path
    & $Command | Out-Host
    $ok = $LASTEXITCODE -eq 0
    Pop-Location
    return $ok
}

# Composer installed on the machine, or the official composer:2 image when it is missing.
# The API runs on the PHP of its Docker image, not on the machine's:
#  - packages are resolved for that PHP version (config.platform.php in composer.json)
#  - a PHP extension missing locally (fileinfo, intl...) must not block the install
#  - scripts (artisan, cache:clear) are not run with the local PHP, which may be older:
#    run them in the container, e.g. docker compose exec backend composer run-script ...
function Invoke-Composer([string]$Path, [string[]]$Arguments) {
    $resolves = $Arguments[0] -in 'install', 'update', 'require', 'create-project'
    $extra = @()
    if ($resolves) { $extra += '--no-scripts' }
    if (Test-Command 'composer') {
        if ($resolves) { $extra += '--ignore-platform-req=ext-*' }
        return Invoke-In $Path { composer @Arguments @extra }
    }
    if ($resolves) { $extra += '--ignore-platform-reqs' }
    return Invoke-In $Path {
        docker run --rm -e COMPOSER_ALLOW_SUPERUSER=1 -v "${Path}:/app" -w /app composer:2 @Arguments @extra
    }
}

# ---------------------------------------------------------------------------
# Console UI
# ---------------------------------------------------------------------------

function Write-Box {
    param([string[]]$Lines, [string]$Color = 'Cyan', [int]$Width = 56)
    $longest = ($Lines | ForEach-Object { $_.Length } | Measure-Object -Maximum).Maximum
    $inner = [Math]::Max($Width, $longest + 4)

    Write-Host ('  ╔' + ('═' * $inner) + '╗') -ForegroundColor $Color
    foreach ($line in $Lines) {
        Write-Host '  ║  ' -NoNewline -ForegroundColor $Color
        Write-Host $line.PadRight($inner - 2) -NoNewline -ForegroundColor White
        Write-Host '║' -ForegroundColor $Color
    }
    Write-Host ('  ╚' + ('═' * $inner) + '╝') -ForegroundColor $Color
}

function Write-Title([string]$Title) {
    $label = " $Title "
    Write-Host ''
    Write-Host '  ──' -NoNewline -ForegroundColor DarkCyan
    Write-Host $label -NoNewline -ForegroundColor Cyan
    Write-Host ('─' * [Math]::Max(4, 56 - $label.Length)) -ForegroundColor DarkCyan
    Write-Host ''
}

function Write-Ok([string]$Message) {
    Write-Host '    [OK] ' -NoNewline -ForegroundColor Green
    Write-Host $Message
}

function Write-Warn([string]$Message) {
    Write-Host '    [!]  ' -NoNewline -ForegroundColor Yellow
    Write-Host $Message -ForegroundColor Yellow
}

function Write-Fail([string]$Message) {
    Write-Host '    [X]  ' -NoNewline -ForegroundColor Red
    Write-Host $Message -ForegroundColor Red
}

function Write-Info([string]$Message) {
    Write-Host "         $Message" -ForegroundColor DarkGray
}

function Write-MenuItem([string]$Key, [string]$Label, [string]$Hint) {
    Write-Host '    [' -NoNewline -ForegroundColor DarkGray
    Write-Host $Key -NoNewline -ForegroundColor Cyan
    Write-Host '] ' -NoNewline -ForegroundColor DarkGray
    Write-Host $Label.PadRight(16) -NoNewline -ForegroundColor White
    Write-Host $Hint -ForegroundColor DarkGray
}

function Read-Default([string]$Prompt, [string]$Default) {
    Write-Host '    › ' -NoNewline -ForegroundColor Cyan
    Write-Host $Prompt -NoNewline
    if ($Default) { Write-Host " [$Default]" -NoNewline -ForegroundColor DarkGray }
    Write-Host ' : ' -NoNewline
    $value = Read-Host
    if ([string]::IsNullOrWhiteSpace($value)) { return $Default }
    return $value.Trim()
}

# $YesKey / $NoKey can be set by the caller to change the hint letters (default O/N)
function Read-YesNo([string]$Prompt, [bool]$Default = $false) {
    $yes = if ($YesKey) { $YesKey } else { 'O' }
    $no = if ($NoKey) { $NoKey } else { 'N' }
    $hint = if ($Default) { "$($yes.ToUpper())/$($no.ToLower())" } else { "$($yes.ToLower())/$($no.ToUpper())" }
    $value = Read-Default $Prompt $hint
    if ($value -eq $hint) { return $Default }
    return $value.ToLower() -in @('o', 'oui', 'y', 'yes')
}
