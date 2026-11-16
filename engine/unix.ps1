# DC Scaffold engine on macOS and Linux (PowerShell 7): what Windows does with winget, the registry and Program Files.
# Dot-sourced by dc-scaffold.ps1 when $OnUnix. Nothing is ever run with sudo: what needs it is written for the user to type.
#   macOS   Homebrew when it is installed (brew install ...), otherwise the official installers or download pages
#   Linux   the command of the package manager of the distribution (apt, dnf, pacman, zypper) or the download page;
#           Node.js and Composer go into the folders of the user (~/.local), without sudo

# Every tool installed with winget on Windows (same ids): Homebrew formula, package of the distributions, pages
$UnixTools = @{
    'Docker.DockerDesktop'       = @{ Brew = @('--cask', 'docker-desktop'); Package = ''; Mac = 'https://docs.docker.com/desktop/setup/install/mac-install/'; Linux = 'https://docs.docker.com/engine/install/' }
    'Microsoft.VisualStudioCode' = @{ Brew = @('--cask', 'visual-studio-code'); Package = ''; Mac = 'https://code.visualstudio.com/download'; Linux = 'https://code.visualstudio.com/docs/setup/linux' }
    'Git.Git'                    = @{ Brew = @('git'); Package = 'git'; Mac = 'https://git-scm.com/download/mac'; Linux = 'https://git-scm.com/download/linux' }
    'PHP'                        = @{ Brew = @('php'); Package = 'php-cli'; Mac = 'https://www.php.net/downloads'; Linux = 'https://www.php.net/downloads' }
}

# A web page in the default browser (the window of DC Scaffold stays open)
function Open-Url([string]$Url) {
    $opener = if ($IsMacOS) { 'open' } else { 'xdg-open' }
    if (Test-Command $opener) { Start-Process $opener -ArgumentList $Url -ErrorAction SilentlyContinue }
}

# brew install, with its messages; $true when it worked
function Invoke-Brew([string]$Label, [string[]]$Arguments, [string]$Url) {
    Write-Info (T 'installing' $Label)
    $env:HOMEBREW_NO_ENV_HINTS = '1'
    brew install @Arguments | Out-Host
    $ok = $LASTEXITCODE -eq 0
    Update-SessionPath
    if ($ok) { Write-Ok (T 'install_done' $Label) } else { Write-Warn (T 'install_failed' $Label $Url) }
    return $ok
}

# Command to type on Linux for a package ("sudo apt install git"), empty when unknown
function Get-LinuxInstallCommand([string]$Package) {
    if (-not $IsLinux -or -not $Package) { return '' }
    if (Test-Command 'apt-get') { return "sudo apt install $Package" }
    if (Test-Command 'dnf') { return "sudo dnf install $Package" }
    if (Test-Command 'pacman') { return "sudo pacman -S $($Package -replace '-cli$', '')" }
    if (Test-Command 'zypper') { return "sudo zypper install $($Package -replace '-cli$', '')" }
    return ''
}

# Commands put into ~/.local/bin: the terminal of the user must have it in its PATH
function Write-LocalBinHint {
    Write-Info (T 'local_bin_hint')
}

function Install-UnixTool([string]$Label, [string]$WingetId) {
    $tool = $UnixTools[$(if ($WingetId -like 'PHP.PHP.*') { 'PHP' } else { $WingetId })]
    if (-not $tool) { return $false }
    if ($IsMacOS -and (Test-Command 'brew')) { return Invoke-Brew $Label $tool.Brew $tool.Mac }
    # macOS without Homebrew: Git comes with the developer tools of Apple (their installer opens)
    if ($IsMacOS -and $WingetId -eq 'Git.Git') {
        & xcode-select --install 2>$null
        Write-Warn (T 'git_xcode')
        return $false
    }
    $url = if ($IsMacOS) { $tool.Mac } else { $tool.Linux }
    $command = Get-LinuxInstallCommand $tool.Package
    if ($command) { Write-Warn (T 'unix_install_command' $Label $command $url) }
    else {
        Write-Warn (T 'unix_install_page' $Label $url)
        Open-Url $url
    }
    return $false
}

# Node.js LTS ($Version: "24.11.1", or "lts" when nodejs.org did not answer)
function Install-UnixNode([string]$Version) {
    $major = if ($Version -match '^\d+') { $Matches[0] } else { '' }
    if ($IsMacOS -and (Test-Command 'brew')) {
        # The "node" of Homebrew is the newest version, not the LTS: node@<major of the LTS>, linked as node
        $formula = if ($major) { "node@$major" } else { 'node' }
        if ((Invoke-Brew "Node.js ($formula)" @($formula) 'https://nodejs.org/') -and $major) {
            brew link --overwrite --force $formula | Out-Host
            Update-SessionPath
        }
        return
    }
    if ($Version -notmatch '^\d+\.\d+\.\d+$') {
        Write-Warn (T 'unix_install_page' 'Node.js LTS' 'https://nodejs.org/en/download')
        Open-Url 'https://nodejs.org/en/download'
        return
    }
    $temp = [IO.Path]::GetTempPath()
    if ($IsMacOS) {
        # The official installer of nodejs.org: macOS asks for the password itself
        $pkg = Join-Path $temp "node-v$Version.pkg"
        try { Invoke-WebRequest "https://nodejs.org/dist/v$Version/node-v$Version.pkg" -OutFile $pkg -UseBasicParsing }
        catch { Write-Warn (T 'install_failed' 'Node.js' 'https://nodejs.org/en/download'); return }
        & open $pkg
        Write-Info (T 'node_pkg_opened' $Version)
        $null = Confirm-Choice (T 'node_pkg_question' $Version) $true
        Update-SessionPath
        return
    }
    # Linux: the official files of nodejs.org (checked with their sha256) in ~/.local/lib/nodejs, node / npm / npx in ~/.local/bin
    $arch = if ("$([Runtime.InteropServices.RuntimeInformation]::OSArchitecture)" -eq 'Arm64') { 'arm64' } else { 'x64' }
    $name = "node-v$Version-linux-$arch"
    $folder = Join-Path $HOME '.local/lib/nodejs'
    $bin = Join-Path $HOME '.local/bin'
    $archive = Join-Path $temp "$name.tar.gz"
    Write-Info (T 'installing' "Node.js $Version")
    try {
        Invoke-WebRequest "https://nodejs.org/dist/v$Version/$name.tar.gz" -OutFile $archive -UseBasicParsing
        Invoke-WebRequest "https://nodejs.org/dist/v$Version/SHASUMS256.txt" -OutFile "$archive.sha256" -UseBasicParsing
        $line = [IO.File]::ReadAllLines("$archive.sha256") | Where-Object { $_ -match "\s$([regex]::Escape("$name.tar.gz"))$" } | Select-Object -First 1
        if (-not $line -or (Get-FileHash $archive -Algorithm SHA256).Hash -ne ($line -split '\s+')[0]) { throw 'sha256' }
        New-Item -ItemType Directory -Path $folder, $bin -Force | Out-Null
        & tar -xzf $archive -C $folder
        if ($LASTEXITCODE -ne 0) { throw 'tar' }
        foreach ($command in 'node', 'npm', 'npx', 'corepack') {
            $target = Join-Path $folder "$name/bin/$command"
            if (Test-Path $target) { & ln -sf $target (Join-Path $bin $command) }
        }
        Update-SessionPath
        # A library of the system can be missing (libatomic on a minimal system): its message, as node gives it
        $check = & (Join-Path $bin 'node') --version 2>&1 | Out-String
        if ($LASTEXITCODE -ne 0) { Write-Warn $check.Trim(); throw 'node' }
        Write-Ok (T 'node_user_done' $Version (Join-Path $folder $name))
        Write-LocalBinHint
    } catch {
        Write-Warn (T 'install_failed' 'Node.js' 'https://nodejs.org/en/download')
    } finally {
        Remove-Item $archive, "$archive.sha256" -ErrorAction SilentlyContinue
    }
}

# Composer: Homebrew on macOS, otherwise composer.phar (checked with its sha256) as ~/.local/bin/composer
function Install-UnixComposer([string]$Site) {
    if ($IsMacOS -and (Test-Command 'brew')) { return Invoke-Brew 'Composer' @('composer') 'https://getcomposer.org/download/' }
    $bin = Join-Path $HOME '.local/bin'
    $phar = Join-Path $bin 'composer'
    Write-Info (T 'installing' 'Composer')
    try {
        New-Item -ItemType Directory -Path $bin -Force | Out-Null
        Invoke-WebRequest "$Site/download/latest-stable/composer.phar" -OutFile $phar -UseBasicParsing
        Invoke-WebRequest "$Site/download/latest-stable/composer.phar.sha256" -OutFile "$phar.sha256" -UseBasicParsing
        $expected = ([IO.File]::ReadAllText("$phar.sha256").Trim() -split '\s+')[0]
        Remove-Item "$phar.sha256"
        if ((Get-FileHash $phar -Algorithm SHA256).Hash -ne $expected) { throw 'sha256' }
        & chmod +x $phar
        Update-SessionPath
        Write-Ok (T 'install_done' 'Composer')
        Write-LocalBinHint
        return $true
    } catch {
        Remove-Item $phar, "$phar.sha256" -ErrorAction SilentlyContinue
        Write-Warn (T 'install_failed' 'Composer' 'https://getcomposer.org/download/')
        return $false
    }
}

# VS Code outside the PATH: inside its app (macOS), or where the packages of Linux put it
function Find-UnixVSCode {
    $candidates = @(
        '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'
        (Join-Path $HOME 'Applications/Visual Studio Code.app/Contents/Resources/app/bin/code')
        '/usr/share/code/bin/code'
        '/snap/bin/code'
    )
    return $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}

# Starts Docker Desktop (macOS, or Docker Desktop for Linux: a service of the user) and waits up to 3 minutes.
# The Docker Engine of Linux is a service of the system: started by the user (sudo), only explained here.
function Start-UnixDocker {
    if ($IsMacOS) {
        $app = @('/Applications/Docker.app', (Join-Path $HOME 'Applications/Docker.app')) | Where-Object { Test-Path $_ } | Select-Object -First 1
        if (-not $app) { return $false }
        & open -a $app
    } elseif ((Test-Command 'systemctl') -and (systemctl --user cat docker-desktop.service 2>$null)) {
        & systemctl --user start docker-desktop
    } else {
        Write-Info (T 'docker_start_linux')
        return $false
    }
    Write-Info (T 'docker_starting')
    for ($i = 0; $i -lt 60; $i++) {
        if (Test-DockerRunning) { return $true }
        Start-Sleep -Seconds 3
    }
    return $false
}

# A port is used when nothing else can listen on it (Get-NetTCPConnection only exists on Windows)
function Test-UnixPortInUse([int]$Port) {
    $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Any, $Port)
    try { $listener.Start(); return $false } catch { return $true } finally { $listener.Stop() }
}
