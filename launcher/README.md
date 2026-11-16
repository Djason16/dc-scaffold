# DCScaffold.exe (and DC Scaffold.app, DCScaffold on Linux)

The program installed on the computer: the **DC Scaffold window**. The same Go code for Windows, macOS and Linux.

- `main.go` starts a small web server on `127.0.0.1` (random port, random token: no other page or machine can use it)
  and opens it in a browser **in application mode** (`--app`: no address bar, no tabs, its own profile):
  Microsoft Edge on Windows (Chrome when Edge is missing), Chrome, Edge, Brave or Chromium on macOS and Linux
  (otherwise a tab of the default browser).
- `ui/` (built into the program): `index.html`, `app.css`, `app.js`, Barlow Condensed fonts, images. Five steps: project,
  front, back end, options, creation; texts in French and English.
- `app.go`: the `/api/...` calls of the window (stacks, folder check, creation, live output, open the folder / VS Code /
  start the project, update). `stacks.go` reads the `stack.json` files and `settings.json`.
- `job.go`: runs `engine/dc-scaffold.ps1 -Ui` without a console window and streams its output (Server-Sent Events).
  The engine sends its progress as `##DCS {json}` lines (`step`, `root`, `question`, `answered`, `done`); cancel stops the
  whole process tree and deletes the half-created folder.
- Questions (install Node.js, new major version...): the engine sends a `question` event and waits for the file
  `$DCS_ANSWERS/<id>`; the window shows the question and `/api/answer` writes `y` or `n` in that file.
- `update.go`: latest GitHub release and its file for this system; the window shows an "Update" button.
  `update_windows.go`: downloads and opens the new installer. `update_unix.go`: macOS, the new app is downloaded into
  Downloads and shown in the Finder (disk image opened, or zip extracted), the user drags it into Applications;
  Linux, the archive is extracted and its `install.sh --update` run.
- The window keeps a connection open to `/api/alive`: once closed (nothing for 20 s, nothing being created), the program stops.
- `paths.go`: folder of the settings, custom stacks, catalog and window profile: `%APPDATA%\DC Scaffold` and
  `%LOCALAPPDATA%\DC Scaffold` on Windows, `~/Library/Application Support/DC Scaffold` on macOS,
  `~/.config/dc-scaffold` on Linux (the engine uses the same, see `Get-DataDir`).
- `platform_windows.go`: Edge, folder picker (the modern one of Windows), Explorer, VS Code, `start.ps1 -Action D` in a console.
- `platform_unix.go` (macOS and Linux): PowerShell 7 (`pwsh`, a clear message when it is missing), the PATH of the login
  shell (a program opened from the Finder or a menu gets a short PATH), the browser window, terminal windows (a small
  script run by the terminal), language (`LANG`...).
  `platform_darwin.go`: browsers of `/Applications`, folder picker and error dialog with `osascript`, Terminal (`.command`
  file), `open`, VS Code inside its app. `platform_xdg.go` (Linux): browsers and terminals of the PATH
  (`x-terminal-emulator`, `gnome-terminal`, `konsole`...), `zenity` / `kdialog`, `xdg-open`.

Options: `--console` (the engine in a console window, with its questions; also used when no browser is found),
`--no-update`, `--no-window` (prints the address instead of opening the window). Any other argument
(`-Name "Site" -Front vue...`) runs the console engine with it. The `dcscaffold` command of the terminal runs the console engine.

Development:

```
cd launcher
DCS_ROOT=.. go run . --no-update                       # macOS, Linux (DCS_BROWSER=chromium: a given browser)
$env:DCS_ROOT = '..'; go run . --no-update             # Windows
GOOS=darwin GOARCH=arm64 go vet ./...                   # checks the code of another system
```

Version and update repository are set at build time (`-X main.version`, `-X main.updateRepo`) by `installer/build.sh`
(Windows, with `-H windowsgui`: a window program, no console), `installer/build-mac.sh` and `installer/build-linux.sh`.
`icon.ico`, `resources.rc` and `app.manifest` are compiled into `rsrc_windows_amd64.syso` by `installer/build.sh`.

The installers (Windows wizard, macOS app, Linux archive) are in [`../installer`](../installer/README.md).
