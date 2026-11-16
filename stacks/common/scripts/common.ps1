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

# macOS / Linux: the folders of Homebrew and ~/.local/bin in the PATH, even in a window opened from the Finder or a menu
function Add-ToolPaths {
    if (-not ($IsMacOS -or $IsLinux)) { return }
    $current = @($env:PATH -split ':' | Where-Object { $_ })
    $extra = @('/opt/homebrew/bin', '/opt/homebrew/sbin', '/usr/local/bin', (Join-Path $HOME '.local/bin')) |
        Where-Object { $current -notcontains $_ -and (Test-Path $_) }
    if ($extra) { $env:PATH = (@($extra) + $current) -join ':' }
}
Add-ToolPaths

# macOS / Linux: a new terminal window running pwsh with these arguments, in the folder $Path.
# A script file: Terminal opens the .command files itself (macOS), every Linux terminal runs a file the same way.
# No terminal (server without desktop): the command runs in the background, its output in a log file.
function Start-TerminalWindow([string]$Path, [string]$Title, [string[]]$Arguments) {
    $pwsh = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
    $quote = { param([string]$Text) "'" + $Text.Replace("'", "'\''") + "'" }
    $line = (@($pwsh) + $Arguments | ForEach-Object { & $quote $_ }) -join ' '
    $extension = if ($IsMacOS) { '.command' } else { '.sh' }
    $script = Join-Path ([IO.Path]::GetTempPath()) ("dc-scaffold-" + [guid]::NewGuid().ToString('n') + $extension)
    [IO.File]::WriteAllText($script, "#!/bin/sh`nrm -f `"`$0`"`ncd $(& $quote $Path) || exit 1`nexec $line`n")
    & chmod 755 $script
    if ($IsMacOS) { & open -a Terminal $script; return }
    foreach ($terminal in @('x-terminal-emulator -e', 'gnome-terminal --', 'kgx --', 'konsole -e', 'xfce4-terminal -x', 'mate-terminal -x', 'tilix -e', 'terminator -x', 'alacritty -e', 'kitty', 'foot', 'xterm -e')) {
        $name, $option = $terminal -split ' '
        if (Test-Command $name) {
            Start-Process $name -ArgumentList (@($option, $script) | Where-Object { $_ }) -WorkingDirectory $Path
            return
        }
    }
    Remove-Item $script -ErrorAction SilentlyContinue
    $log = Join-Path ([IO.Path]::GetTempPath()) (($Title -replace '[^\w-]+', '-').Trim('-').ToLower() + '.log')
    Start-Process $pwsh -ArgumentList ($Arguments | Where-Object { $_ -ne '-NoExit' }) -WorkingDirectory $Path -RedirectStandardOutput $log -RedirectStandardError "$log.err"
    Write-Info "No terminal found: $Title runs in the background, its messages in $log"
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
    # Linux: the files of vendor/ belong to the user, not to root (Docker Desktop of Windows and macOS does it itself)
    $user = if ($IsLinux) { @('--user', "$(id -u):$(id -g)", '-e', 'COMPOSER_HOME=/tmp/composer') } else { @() }
    return Invoke-In $Path {
        docker run --rm -e COMPOSER_ALLOW_SUPERUSER=1 @user -v "${Path}:/app" -w /app composer:2 @Arguments @extra
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
