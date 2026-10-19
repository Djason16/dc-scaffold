# Changelog

All notable changes to DC Scaffold. Format: [Keep a Changelog](https://keepachangelog.com/), versions: [SemVer](https://semver.org/).

## [1.0.0] - 2026-10-19

First public version.

### The window
- `DCScaffold.exe` opens a real application window (Microsoft Edge in application mode) in the style of the installer: five steps (project, site, server, options, creation), a card per framework, folder picker, summary, live progress and log, cancel, then "Start the project", "Open the folder" and "Open in VS Code"; French or English
- Size adapted to the screen (work area without the taskbar): every step fits without scrolling, even on small laptop screens
- Texts written for beginners: every choice and option is explained in plain words
- Questions of the creation asked in the window (install or update Node.js, Docker, Git, VS Code, Composer, a new major version, PHP extensions), with the log lines that explain them
- "Console version" button: the same engine in a PowerShell console, every question asked there and answered with the keyboard, the console stays open at the end (`dcscaffold` in a terminal)
- Updates offered by an "Update" button (latest GitHub release)

### Installation of the tools
- Everything the chosen options need is checked and installed before anything is created (winget, after asking): Node.js LTS, Docker Desktop (started when stopped), PHP and Composer (PHP servers, the PHP version of Docker), Git, Visual Studio Code with GitHub Copilot and the extensions of the chosen stacks (Vue, Svelte, Astro, PHP Intelephense, Laravel); Composer optional (Docker image); local PHP extensions enabled in `php.ini` on request
- Latest framework versions checked on npm and Packagist; a new major version is offered, never forced
- `DCScaffold-Setup.exe`: Windows installer in French or English, for the current user without administrator rights; uninstaller (settings and custom stacks optional)

### Projects
- Sites (front): Nuxt, Next.js, SvelteKit, Vue, React, Angular, Astro, HTML / CSS / JS, none
- Servers (back end): Slim 4, Laravel, Symfony, PHP, Nitro (with any front), Express, none
- Folders `frontend/` and `backend/`, `start.bat` to develop, install and build; Docker only when needed: MySQL (latest LTS) with phpMyAdmin for the PHP back ends, MySQL or SQLite for Nitro and Express; `mysqli` or `PDO` in PHP
- Automatic API routes from controller method names, the same JSON responses and helpers in every back end
- Same front architecture everywhere: AppShell (loader on every page change, header, footer, back to top, languages), components, composables, middleware, pages, plugins, stores (cookie consent), utils, assets/css with simple variables
- Same design on every page: a few variables in `assets/css/utils/variables.css`, reusable **PageHero** (home page and 404 page), loader in the colors of the site, favicon
- Sites in one or two languages: with one language, no language buttons and no translation system, the texts are written straight into the components (`t('key')` replaced by its text in the syntax of each framework), and the comments and the README only talk about what the project has
- Cookie banner, SEO, `sitemap.xml` and `robots.txt` in every front
- DC Scaffold design or blank page: every site opens with the DC Scaffold design (dark theme, Barlow Condensed, loader, "What next?" home page with the real paths of the chosen framework, Djason CHERY logo linked to https://djason-chery.dev/); `design: false` in `frontend/dc-scaffold.config.js` gives a blank site with a simple style (white, font of the system), and nothing of the `dc-scaffold/` folder (theme, fonts, welcome page) goes into the build
- One `README.md` per project in the language of DC Scaffold (start, where to change what, small glossary), code comments in the same language, `.vscode/extensions.json` with the recommended extensions
- A failed or cancelled creation deletes the half-created project

### Always working
- Online catalog of stacks: DC Scaffold downloads the newest tested stacks when it opens (release `catalog`, checked with sha256), without being reinstalled
- Compatibility robot (`.github/workflows/compatibility.yml`, `tools/robot/robot.py`): every Monday, creates and checks a project with every stack and the latest stable versions (a new major version waits 30 days): build, type check of SvelteKit and Angular, start of the server; checks the Docker images (latest MySQL LTS, latest PHP out for 6 months, `stacks/infra/versions.json`) with a real MySQL query and every PHP server, raises the validated versions that work, publishes the catalog, and opens a GitHub issue for the ones that break

### Customization
- Every stack is a `stack.json` file, editable without rebuilding; custom stacks in `%APPDATA%\DC Scaffold\stacks` are kept by updates
- `VERSION` file: the only place to change the version
