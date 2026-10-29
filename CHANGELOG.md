# Changelog

All notable changes to DC Scaffold. Format: [Keep a Changelog](https://keepachangelog.com/), versions: [SemVer](https://semver.org/).

## [1.2.0] - 2026-10-29

### Nuxt + Nitro: one project
- Nitro is the server of Nuxt: with Nuxt, the API now goes inside the site (`frontend/server/`) instead of a separate `backend/` folder. One folder, one `npm run dev` (site on http://localhost:3000, API on http://localhost:3000/api), one build (`start.bat` then `B`) and one `npm start` to put both online
- Same controllers, helpers, automatic routes, JSON errors and MySQL or SQLite as the separate Nitro; no CORS to set (same address); `api.get('/products')` calls `/api/products`, also on the first display of a page (inside Nuxt, without the network)
- The pages are rendered on each visit (always the latest data of the API) instead of a static site
- With any other front, Nitro stays in `backend/` as before. The window says it on the Nitro card ("Inside Nuxt") and in the summary, and hides the API port
- For stack authors: `"inside"` in the stack.json of a back end (see stacks/README.md), conditions `separateApi` / `insideApi`; the compatibility robot tests these pairs (`combos/nuxt-nitro`)

### API inside the site: also for Next.js, SvelteKit, Astro and Qwik
- New back end **API inside the site**, offered with the fronts that have their own server (same mode as Nuxt + Nitro): the API goes into the site (`frontend/server/` for Next.js, `src/lib/server/` for SvelteKit, `src/server/` for Astro and Qwik), under `/api`, with the same controllers, helpers, automatic routes, JSON errors and MySQL (phpMyAdmin in Docker) or SQLite
- One folder, one `npm run dev`, one build (`start.bat` then `B`) and one `npm start` online (Node.js host): Next.js runs `next start`, SvelteKit `adapter-node`, Astro `@astrojs/node`, Qwik its Node.js server adapter; the pages stay prerendered, only `/api` answers on each request
- A new controller file is picked up by itself, also while `npm run dev` runs (`import.meta.glob`)
- The compatibility robot tests each pair (`combos/next-site`, `combos/sveltekit-site`, `combos/astro-site`, `combos/qwik-site`)

### Going online, step by step
- Every project has a "Going online" section in its README, and the same steps under the `start.bat` menu, for the chosen front and back end: online settings of the API, address of the API for the site (before the build), what to upload for the site, what to upload for the API
- With a separate API (PHP, Express...), it says it plainly: the build of the site does not contain the API, they are two separate uploads (often two addresses); with an API inside the site, one server and one upload

### Fixes
- `start.bat` offers only the production build that fits the project: Nuxt with a separate API (PHP or other) or without one gets `G` (static site) only, no more `B` (`nuxt build`, a Node.js server that made no sense next to a PHP API); Nuxt + Nitro gets `B` only (site + API in one Node.js server). Every option says what it produces
- Nitro (separate): `npm run dev` only answered on `::1` (IPv6) since the latest Nitro 2, so `http://127.0.0.1` and the compatibility robot could not reach it; it now listens on every address, like Express and NestJS
- Docker image of the PHP back ends: works with PHP 8.5 (OPcache is built into PHP since 8.5 and could no longer be installed), so the compatibility robot can move to PHP 8.5

## [1.1.0] - 2026-10-21

### Fronts
- Three new sites (front), with the same architecture as the other ones (AppShell, cookie banner, 404 page, SEO, `sitemap.xml`, one or two languages, DC Scaffold design or blank page):
  - **Svelte (Vite)**: Svelte on a single page, next to SvelteKit; pages = files of `src/pages`, links without reloading
  - **SolidJS (Vite)**: like React, faster and lighter; Solid Router, store with `createMutable`
  - **Qwik**: static site from Qwik City, almost no JavaScript to load, in TypeScript; texts written `t(lang, 'key')`
- The window shows the fronts on four columns, and still fits without scrolling on small laptop screens; shorter card texts

### Back ends
- Two new servers (back end), with the same helpers (`ResponseHelper`, `RequestHelper`, `fetchAll`...), automatic routes (`getAll()` -> `GET /products`), JSON errors, CORS and MySQL or SQLite:
  - **NestJS**: official structure of the Nest CLI, in TypeScript; the automatic routes come from `src/controllers`, classic Nest controllers work next to them
  - **AdonisJS**: official API kit (user accounts with access tokens, VineJS validation, Lucid); the controllers of `app/controllers` get their routes automatically, the queries go through Lucid; needs Node.js 24
- Shorter card texts for the server step; the comments added by a stack in a file of the framework are in the language of the project too

### SEO
- Every front adds `<meta name="generator" content="DC Scaffold">`, so tools like Wappalyzer can tell the site was made with DC Scaffold; one line to remove in `utils/seo.js` to hide it

### Fixes
- Cookie banner: "Cookie settings" opens it again on the current choice, with the boxes shown (all checked after "Accept all"), instead of forgetting the choice; every front
- Qwik: an address without a page shows the 404 page of the site while it runs (`npm run dev`), not the list of routes of Qwik City
- "Launch the project": the PowerShell window stayed open half a second then closed; it now opens in its own console and stays open on the dev server
- SolidJS: `jsconfig.json` without `baseUrl`, which TypeScript marks as deprecated (removed in TypeScript 7)

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
