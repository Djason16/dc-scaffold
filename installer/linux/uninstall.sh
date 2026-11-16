#!/bin/sh
# Removes DC Scaffold of this account: the program, the dcscaffold command, the entry of the menu. Projects are never touched.
#   ~/.local/share/dc-scaffold/uninstall.sh          settings and custom stacks kept (~/.config/dc-scaffold)
#   ~/.local/share/dc-scaffold/uninstall.sh --all    also the settings, custom stacks, downloaded stacks and window profile
DATA=${XDG_DATA_HOME:-$HOME/.local/share}
CONFIG=${XDG_CONFIG_HOME:-$HOME/.config}

rm -rf "$DATA/dc-scaffold"
rm -f "$HOME/.local/bin/dcscaffold" "$DATA/applications/dc-scaffold.desktop" \
    "$DATA/icons/hicolor/64x64/apps/dc-scaffold.png" "$DATA/icons/hicolor/256x256/apps/dc-scaffold.png"
update-desktop-database "$DATA/applications" >/dev/null 2>&1 || true
if [ "$1" = "--all" ]; then rm -rf "$CONFIG/dc-scaffold"; fi

case "${LC_ALL:-${LC_MESSAGES:-${LANG:-}}}" in
    fr*) echo "DC Scaffold est désinstallé. Tes projets n'ont pas été touchés." ;;
    *) echo "DC Scaffold is uninstalled. Your projects were not touched." ;;
esac
