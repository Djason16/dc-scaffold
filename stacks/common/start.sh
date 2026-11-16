#!/bin/sh
# Launcher of the project on macOS and Linux: the menu of start.ps1 (the same as start.bat on Windows)
# Usage: ./start.sh (menu) or ./start.sh -Action D|S|R|I|G|B|A|Q|K|O|P
cd "$(dirname "$0")" || exit 1
if ! command -v pwsh >/dev/null 2>&1; then
    echo "PowerShell 7 (pwsh) is needed: brew install --cask powershell (macOS), sudo snap install powershell --classic (Linux)"
    echo "https://learn.microsoft.com/powershell/scripting/install/installing-powershell"
    exit 1
fi
exec pwsh -NoProfile -File ./start.ps1 "$@"
