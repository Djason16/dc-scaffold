# DCScaffold.exe

The program installed on the PC: the **DC Scaffold window**.

- `main.go` starts a small web server on `127.0.0.1` (random port, random token: no other page or machine can use it)
  and opens it in **Microsoft Edge in application mode** (`--app`: no address bar, no tabs, its own profile in
  `%LOCALAPPDATA%\DC Scaffold\window`). Chrome is used when Edge is missing.
- `ui/` (built into the exe): `index.html`, `app.css`, `app.js`, Barlow Condensed fonts, images. Five steps: project,
  front, back end, options, creation; texts in French and English.
- `app.go`: the `/api/...` calls of the window (stacks, folder check, creation, live output, open the folder / VS Code /
  start the project, update). `stacks.go` reads the `stack.json` files and `%APPDATA%\DC Scaffold\settings.json`.
- `job.go`: runs `engine\dc-scaffold.ps1 -Ui` without a console window and streams its output (Server-Sent Events).
  The engine sends its progress as `##DCS {json}` lines (`step`, `root`, `question`, `answered`, `done`); cancel stops the
  whole process tree and deletes the half-created folder.
- Questions (install Node.js, new major version...): the engine sends a `question` event and waits for the file
  `%DCS_ANSWERS%\<id>`; the window shows the question and `/api/answer` writes `y` or `n` in that file.
- `update.go`: latest GitHub release; the window shows an "Update" button, which downloads and opens the new installer.
- The window pings the server every 4 s: once closed (no ping for 25 s, nothing being created), the exe stops.
- `platform_windows.go`: Edge, folder picker (the modern one of Windows), Explorer, VS Code, `start.ps1 -Action D`.
  `platform_other.go`: the same on Linux / macOS for development (`DCS_BROWSER`, `pwsh`).

Options: `--console` (the engine in a console window, with its questions; also used when no browser is found),
`--no-update`, `--no-window` (prints the address instead of opening the window). Any other argument
(`-Name "Site" -Front vue...`) runs the console engine with it. The `dcscaffold` command of the terminal runs the console engine.

Development:

```
cd launcher
DCS_ROOT=.. DCS_BROWSER=chromium go run . --no-update
```

Version and update repository are set at build time by `installer/build.sh` (`-X main.version`, `-X main.updateRepo`,
`-H windowsgui`: a window program, no console). `icon.ico`, `resources.rc` and `app.manifest` are compiled into
`rsrc_windows_amd64.syso` by `installer/build.sh`.

The installer itself (Windows wizard, uninstaller) is in [`../installer`](../installer/README.md).
