#!/bin/sh
# Builds DC Scaffold.app for macOS on macOS, Linux or WSL (Go cross-compiles): dist/DCScaffold-<version>-mac-<arch>.zip,
# and dist/DCScaffold-<version>-mac-<arch>.dmg when hdiutil is there (macOS). Not signed by Apple (see installer/README.md).
#   UPDATE_REPO=owner/repo ARCHS="arm64 x64" ./installer/build-mac.sh
# UPDATE_REPO: the GitHub repository checked for updates (default Djason16/dc-scaffold, empty = no update check)
set -e
cd "$(dirname "$0")/.."
VERSION=$(cat VERSION)
UPDATE_REPO=${UPDATE_REPO-Djason16/dc-scaffold}
DIST=${DIST:-dist}
mkdir -p "$DIST"
DIST=$(cd "$DIST" && pwd)

# 4 bytes, big endian (sizes of the .icns file)
be32() {
    printf "\\$(printf %03o $(($1 >> 24 & 255)))\\$(printf %03o $(($1 >> 16 & 255)))\\$(printf %03o $(($1 >> 8 & 255)))\\$(printf %03o $(($1 & 255)))"
}

# Icon of the app: an .icns file holding the PNG icons of assets/ (icp6: 64 px, ic08: 256 px)
make_icns() {
    small=$(wc -c < assets/icon-64.png | tr -d ' ')
    large=$(wc -c < assets/icon-256.png | tr -d ' ')
    {
        printf icns; be32 $((8 + 8 + small + 8 + large))
        printf icp6; be32 $((8 + small)); cat assets/icon-64.png
        printf ic08; be32 $((8 + large)); cat assets/icon-256.png
    } > "$1"
}

for ARCH in ${ARCHS:-arm64 x64}; do
    case $ARCH in
        arm64) GOARCH=arm64 ;;
        x64) GOARCH=amd64 ;;
        *) echo "Unknown processor: $ARCH (arm64 or x64)"; exit 1 ;;
    esac
    NAME=DCScaffold-$VERSION-mac-$ARCH
    STAGE=$(mktemp -d)
    APP="$STAGE/DC Scaffold.app"
    mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

    # 1. The program, then what it runs: engine, stacks, assets (without the images of the README)
    (cd launcher && CGO_ENABLED=0 GOOS=darwin GOARCH=$GOARCH go build -trimpath \
        -ldflags="-s -w -X main.version=$VERSION -X main.updateRepo=$UPDATE_REPO" -o "$APP/Contents/MacOS/DCScaffold" .)
    cp -R engine stacks VERSION LICENSE "$APP/Contents/Resources/"
    cp -R assets "$APP/Contents/Resources/"
    rm -rf "$APP/Contents/Resources/assets/readme"
    sed "s/{{VERSION}}/$VERSION/g" installer/mac/Info.plist > "$APP/Contents/Info.plist"
    make_icns "$APP/Contents/Resources/DCScaffold.icns"
    chmod 755 "$APP/Contents/MacOS/DCScaffold"

    # 2. macOS: signature of the whole app without Apple account (ad hoc), needed on Apple Silicon
    if command -v codesign >/dev/null 2>&1; then codesign --force --deep --sign - "$APP"; fi

    # 3. Zip (ditto on macOS keeps everything of the app; zip elsewhere, with the permissions)
    rm -f "$DIST/$NAME.zip"
    if command -v ditto >/dev/null 2>&1; then
        ditto -c -k --sequesterRsrc --keepParent "$APP" "$DIST/$NAME.zip"
    else
        (cd "$STAGE" && zip -qry "$DIST/$NAME.zip" "DC Scaffold.app")
    fi

    # 4. Disk image: the app next to a link to Applications, to drag it there
    if command -v hdiutil >/dev/null 2>&1; then
        ln -s /Applications "$STAGE/Applications"
        rm -f "$DIST/$NAME.dmg"
        hdiutil create -quiet -volname "DC Scaffold" -srcfolder "$STAGE" -ov -format UDZO "$DIST/$NAME.dmg"
    fi
    rm -rf "$STAGE"
    echo "$NAME $(ls "$DIST" | grep -c "^$NAME\.") file(s) in $DIST"
done
