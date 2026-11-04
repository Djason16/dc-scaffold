# Builds DCScaffold-Setup.exe (repository root) on Windows with Docker Desktop: the same build as GitHub
# (installer/build.sh in a Linux container with Go, NSIS and mingw). Nothing else to install.
#   .\installer\build-docker.ps1 -UpdateRepo owner/repo    GitHub repository checked for updates (default Djason16/dc-scaffold, '' = no update check)
# The NSIS of Windows has no amd64-unicode stubs (needed by dc-scaffold.nsi), the Linux one does.
param([string]$UpdateRepo = 'Djason16/dc-scaffold')
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent

docker info *> $null
if ($LASTEXITCODE -ne 0) { throw 'Docker is not running: start Docker Desktop, then run this script again.' }

$script = 'apt-get update -qq >/dev/null && apt-get install -y -qq nsis mingw-w64 >/dev/null && git config --global --add safe.directory /src && ./installer/build.sh'
docker run --rm -e "UPDATE_REPO=$UpdateRepo" -v "${repo}:/src" -w /src golang:1.24-bookworm sh -c $script
if ($LASTEXITCODE -ne 0) { throw 'The build failed (see the messages above).' }

Get-Item (Join-Path $repo 'DCScaffold-Setup.exe') | Select-Object Name, Length, LastWriteTime
