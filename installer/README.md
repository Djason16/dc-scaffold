# DCScaffold-Setup.exe

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

Windows (Go and NSIS 3):

```
.\installer\build.ps1 -UpdateRepo owner/repo
```

`UPDATE_REPO` is the GitHub repository whose releases are checked for updates: Djason16/dc-scaffold by default, empty = no check.
The GitHub workflow fills it: pushing a `v*` tag builds the installer and publishes it as a release,
which every installed DC Scaffold then offers as an update (the repository must be public).

```
git tag v1.1.0
git push --tags
```
