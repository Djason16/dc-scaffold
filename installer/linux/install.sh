#!/bin/sh
# DC Scaffold for Linux: installs this folder for the current user, without sudo.
#   ~/.local/share/dc-scaffold                    the program, the engine and the stacks
#   ~/.local/bin/dcscaffold                       the console version in a terminal (dcscaffold --window: the window)
#   ~/.local/share/applications/dc-scaffold.desktop and its icon: DC Scaffold in the menu of the applications
# Running a newer version over it updates it (the window does it itself: install.sh --update).
# Settings, custom stacks and downloaded stacks (~/.config/dc-scaffold) are kept.
set -e
SOURCE=$(cd "$(dirname "$0")" && pwd)
DATA=${XDG_DATA_HOME:-$HOME/.local/share}
DEST=$DATA/dc-scaffold
BIN=$HOME/.local/bin
VERSION=$(cat "$SOURCE/VERSION")

# Message in French or English, as the language of the session
say() {
    case "${LC_ALL:-${LC_MESSAGES:-${LANG:-}}}" in
        fr*) echo "$1" ;;
        *) echo "$2" ;;
    esac
}

if [ "$SOURCE" = "$DEST" ]; then
    say "DC Scaffold est déjà installé ici : lance install.sh depuis le dossier téléchargé." \
        "DC Scaffold is already installed here: run install.sh from the downloaded folder."
    exit 1
fi

# 1. The program: copied next to the installed one, then swapped (a running DC Scaffold keeps working until it closes)
mkdir -p "$DATA" "$BIN"
rm -rf "$DEST.new" "$DEST.old"
mkdir -p "$DEST.new"
cp -R "$SOURCE/DCScaffold" "$SOURCE/VERSION" "$SOURCE/LICENSE" "$SOURCE/engine" "$SOURCE/stacks" "$SOURCE/assets" \
    "$SOURCE/uninstall.sh" "$DEST.new/"
chmod 755 "$DEST.new/DCScaffold" "$DEST.new/uninstall.sh"
if [ -d "$DEST" ]; then mv "$DEST" "$DEST.old"; fi
mv "$DEST.new" "$DEST"
rm -rf "$DEST.old"

# 2. The dcscaffold command
cat > "$BIN/dcscaffold" <<EOF
#!/bin/sh
# DC Scaffold in a terminal: the console version, with its questions. dcscaffold --window opens the window.
if [ "\$1" = "--window" ]; then
    shift
    exec "$DEST/DCScaffold" "\$@"
fi
exec "$DEST/DCScaffold" --console "\$@"
EOF
chmod 755 "$BIN/dcscaffold"

# 3. Menu of the applications, with the icon (StartupWMClass: the window of the browser shows this icon)
for SIZE in 64 256; do
    mkdir -p "$DATA/icons/hicolor/${SIZE}x${SIZE}/apps"
    cp "$DEST/assets/icon-$SIZE.png" "$DATA/icons/hicolor/${SIZE}x${SIZE}/apps/dc-scaffold.png"
done
mkdir -p "$DATA/applications"
cat > "$DATA/applications/dc-scaffold.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=DC Scaffold
GenericName=Web project creator
GenericName[fr]=Créateur de projets web
Comment=Creates a web project: a front and a back end, ready to code
Comment[fr]=Crée un projet web : un front et un back end, prêts à coder
Exec="$DEST/DCScaffold"
Icon=dc-scaffold
Terminal=false
Categories=Development;
StartupWMClass=DCScaffold
EOF
update-desktop-database "$DATA/applications" >/dev/null 2>&1 || true
gtk-update-icon-cache -q -t "$DATA/icons/hicolor" >/dev/null 2>&1 || true

say "DC Scaffold $VERSION est installé : menu des applications, ou dcscaffold dans un terminal (version console)." \
    "DC Scaffold $VERSION is installed: menu of the applications, or dcscaffold in a terminal (console version)."
case ":$PATH:" in
    *":$BIN:"*) ;;
    *) say "Pour la commande dcscaffold : ajoute export PATH=\"\$HOME/.local/bin:\$PATH\" à ton ~/.profile." \
           "For the dcscaffold command: add export PATH=\"\$HOME/.local/bin:\$PATH\" to your ~/.profile." ;;
esac
if ! command -v pwsh >/dev/null 2>&1; then
    say "Il faut aussi PowerShell 7 (pwsh) : sudo snap install powershell --classic, ou https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-linux" \
        "PowerShell 7 (pwsh) is also needed: sudo snap install powershell --classic, or https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-linux"
fi
