# Installers

| System | File | Made by |
| ------ | ---- | ------- |
| Windows | `DCScaffold-Setup.exe` | `build.sh` / `build.ps1` / `build-docker.ps1` (NSIS) |
| macOS | `DCScaffold-<version>-mac-arm64.dmg` / `.zip`, `-mac-x64.dmg` / `.zip` | `build-mac.sh` |
| Linux | `DCScaffold-<version>-linux-x64.tar.gz` | `build-linux.sh` |

Every file is attached to the GitHub release of its version by `.github/workflows/release.yml` (tag `v*`).

## DCScaffold-Setup.exe

Windows installer made with NSIS 3 (`dc-scaffold.nsi`): the usual Windows wizard, in French or English
(the language of Windows), with the DC Scaffold images (`welcome.bmp`, `header.bmp`, drawn by `make-images.py`).

| Page | |
| ---- | - |
| Welcome | DC Scaffold and Djason CHERY logos |
| License | `LICENSE` |
| Components | DC Scaffold (required), desktop shortcut |
| Folder | `%LOCALAPPDATA%\Programs\DC Scaffold` by default, no administrator rights |
| Finish | "Start DC Scaffold" |

Installed: `DCScaffold.exe` (the DC Scaffold window), `engine\`, `stacks\`, `assets\`, Start menu folder
(DC Scaffold, Uninstall DC Scaffold), `dcscaffold` command (console version, in a terminal), entry in Windows Settings > Apps.
Running a newer setup over it updates it (old templates are replaced).

The uninstaller removes all of that, and the window profile (`%LOCALAPPDATA%\DC Scaffold`);
ticking "My settings and custom stacks" also deletes `%APPDATA%\DC Scaffold`.
Silent: `DCScaffold-Setup.exe /S`, `Uninstall.exe /S`.

## Build

The version comes from `VERSION` (repository root), the only place to change it.

Linux / WSL (Go, `nsis`, `mingw-w64`):

```
UPDATE_REPO=owner/repo ./installer/build.sh
```

Windows with Docker Desktop (recommended on Windows: the same build as GitHub, nothing else to install):

```
.\installer\build-docker.ps1 -UpdateRepo owner/repo
```

Windows without Docker (Go and NSIS 3 with the `amd64-unicode` stubs; the official NSIS for Windows does not have them):

```
.\installer\build.ps1 -UpdateRepo owner/repo
```

`UPDATE_REPO` is the GitHub repository whose releases are checked for updates: Djason16/dc-scaffold by default, empty = no check.
The GitHub workflow (`release.yml`) fills it: pushing a `v*` tag builds the Windows installer, the macOS and Linux files
and publishes them in the release of the tag, which every installed DC Scaffold then offers as an update (the repository must be public).

```
git tag v1.6.0
git push --tags
```

## DC Scaffold.app (macOS)

`build-mac.sh` builds the app bundle for Apple Silicon (`arm64`) and Intel (`x64`), on macOS, Linux or WSL (Go cross-compiles):

```
DC Scaffold.app/Contents/
├── Info.plist           mac/Info.plist with the version (LSUIElement: no Dock icon of its own, the window is the browser's)
├── MacOS/DCScaffold     the Go launcher
└── Resources/           engine/, stacks/, assets/, VERSION, LICENSE, DCScaffold.icns (made from assets/icon-*.png)
```

Zipped as `dist/DCScaffold-<version>-mac-<arch>.zip`; on a Mac (`hdiutil`, `codesign`), the app is also signed ad hoc and
put into `dist/DCScaffold-<version>-mac-<arch>.dmg`, next to a link to Applications. The GitHub workflow builds it on a
macOS runner.

The app is not signed with an Apple Developer account (no notarization): macOS blocks its first opening.
*System Settings > Privacy & Security > Open Anyway* (older macOS: right click > *Open*), or
`xattr -dr com.apple.quarantine "/Applications/DC Scaffold.app"`. Updates downloaded by DC Scaffold itself are not
blocked (no quarantine flag).

## Linux archive

`build-linux.sh` builds `dist/DCScaffold-<version>-linux-<arch>.tar.gz` (`ARCHS="x64 arm64"` for ARM too): the launcher
`DCScaffold`, `engine/`, `stacks/`, `assets/`, `install.sh` and `uninstall.sh` (from `linux/`).

`install.sh` (no sudo) copies everything into `~/.local/share/dc-scaffold` (replaced as a whole on an update, so a running
DC Scaffold keeps working), writes the `dcscaffold` command into `~/.local/bin` (console version; `dcscaffold --window`:
the window) and `~/.local/share/applications/dc-scaffold.desktop` with its icon. The update button of the window runs
`install.sh --update` from the downloaded archive. `uninstall.sh` removes all of that; `uninstall.sh --all` also deletes the
settings and custom stacks (`~/.config/dc-scaffold`).

Both need PowerShell 7 (`pwsh`) on the computer: DC Scaffold shows how to install it when it is missing.

```
UPDATE_REPO=owner/repo ./installer/build-mac.sh
UPDATE_REPO=owner/repo ./installer/build-linux.sh
```
