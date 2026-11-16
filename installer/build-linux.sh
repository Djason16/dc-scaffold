#!/bin/sh
# Builds DC Scaffold for Linux on Linux, macOS or WSL (Go only): dist/DCScaffold-<version>-linux-<arch>.tar.gz,
# a folder with the program, the engine, the stacks, install.sh and uninstall.sh.
#   UPDATE_REPO=owner/repo ARCHS="x64 arm64" ./installer/build-linux.sh
# UPDATE_REPO: the GitHub repository checked for updates (default Djason16/dc-scaffold, empty = no update check)
set -e
cd "$(dirname "$0")/.."
VERSION=$(cat VERSION)
UPDATE_REPO=${UPDATE_REPO-Djason16/dc-scaffold}
DIST=${DIST:-dist}
mkdir -p "$DIST"
DIST=$(cd "$DIST" && pwd)

for ARCH in ${ARCHS:-x64}; do
    case $ARCH in
        x64) GOARCH=amd64 ;;
        arm64) GOARCH=arm64 ;;
        *) echo "Unknown processor: $ARCH (x64 or arm64)"; exit 1 ;;
    esac
    NAME=DCScaffold-$VERSION-linux-$ARCH
    STAGE=$(mktemp -d)
    FOLDER="$STAGE/$NAME"
    mkdir -p "$FOLDER"

    (cd launcher && CGO_ENABLED=0 GOOS=linux GOARCH=$GOARCH go build -trimpath \
        -ldflags="-s -w -X main.version=$VERSION -X main.updateRepo=$UPDATE_REPO" -o "$FOLDER/DCScaffold" .)
    cp -R engine stacks assets VERSION LICENSE "$FOLDER/"
    rm -rf "$FOLDER/assets/readme"
    cp installer/linux/install.sh installer/linux/uninstall.sh "$FOLDER/"
    chmod 755 "$FOLDER/DCScaffold" "$FOLDER/install.sh" "$FOLDER/uninstall.sh"

    tar -C "$STAGE" -czf "$DIST/$NAME.tar.gz" "$NAME"
    rm -rf "$STAGE"
    echo "$NAME.tar.gz in $DIST"
done
