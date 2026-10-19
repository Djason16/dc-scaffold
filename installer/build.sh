#!/bin/sh
# Builds DCScaffold-Setup.exe (repository root) on Linux / WSL: Go, NSIS (makensis) and mingw (windres).
#   UPDATE_REPO=owner/repo ./installer/build.sh    GitHub repository checked for updates (default Djason16/dc-scaffold, empty = no update check)
set -e
cd "$(dirname "$0")"
VERSION=$(cat ../VERSION)
# Updates: the releases of DC Scaffold on GitHub, unless UPDATE_REPO is given (UPDATE_REPO= : no update check)
UPDATE_REPO=${UPDATE_REPO-Djason16/dc-scaffold}
mkdir -p build

# 1. DCScaffold.exe: icon and version information, then the Go launcher
V=$(echo "$VERSION" | tr . ,)
# The version of VERSION is written into resources.rc and app.manifest, whatever they held before
sed -i -E "s/[0-9]+,[0-9]+,[0-9]+,0/$V,0/g; s/\"[0-9]+\.[0-9]+\.[0-9]+\"/\"$VERSION\"/g" ../launcher/resources.rc
sed -i -E "s/version=\"[0-9]+\.[0-9]+\.[0-9]+\.0\"/version=\"$VERSION.0\"/" ../launcher/app.manifest
(cd ../launcher && x86_64-w64-mingw32-windres -O coff -i resources.rc -o rsrc_windows_amd64.syso)
(cd ../launcher && GOOS=windows GOARCH=amd64 go build -trimpath \
    -ldflags="-s -w -H windowsgui -X main.version=$VERSION -X main.updateRepo=$UPDATE_REPO" -o ../installer/build/DCScaffold.exe .)

# 2. License with Windows line breaks for the license page
sed 's/$/\r/' ../LICENSE > build/LICENSE.txt

# 3. Installer
makensis -V2 -DVERSION="$VERSION" dc-scaffold.nsi
echo "DCScaffold-Setup.exe $VERSION"
