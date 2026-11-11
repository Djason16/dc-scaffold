# Changelog

All notable changes to DC Scaffold. Format: [Keep a Changelog](https://keepachangelog.com/), versions: [SemVer](https://semver.org/).

## [Unreleased]

## [1.4.1] - 2026-11-11

Same content as 1.4.0, whose setup could not be published: the build machine of GitHub (Ubuntu 26.04) never got
the packages it needs. The setup is now built on Ubuntu 24.04.

## [1.4.0] - 2026-11-11

Every site can now be shown to its client before it goes online: the qualif, a third environment between dev and
production, for every front and every back end. Sitemaps list the images and the date of every page.

### Qualif (every front, every back end)
- New third environment between dev and production: the **qualif**, the site shown to the client before it goes online,
  in a folder of one shared address (`https://qualifs.example.com/my-site/`). `start.bat` then `Q` builds it with
  `.env.preprod` (the same lines as `.env.production`, only the addresses change) into `qualif/`, ready to upload
- The code stays the one of production: the folder is read in the address and given to the front as its base (Vite, Astro,
  Next, SvelteKit, Angular, Qwik, the router), the paths still written from the root are moved into it after the build,
  the `.htaccess` follows, and nothing is ever indexed (`X-Robots-Tag`, `robots.txt`)
- Node.js servers of the site (Next, SvelteKit, Astro, Qwik): a start module moves the links of the pages into the folder
  as they are sent; Nuxt + Nitro: `server/plugins/qualif.ts`
- Separate API in its own folder (`my-site-api/`) with its own database, its code unchanged: a small entry file for PHP
  (Slim, Laravel, Symfony, PHP), a start module for Node.js (Express, NestJS, AdonisJS, Nitro); settings, `composer.json`
  and the tools are never served
- Docs: "La qualif" in `docs/08-mise-en-ligne.md` (what it is, the folder on the hosting, the steps for each site)

### Sitemaps (every front)
- Every page of `sitemap.xml` now has its date and its images: the ones of its `<main>` in the built page, else the files
  of `public/` its page file shows; a page with `noindex` stays out, addresses are escaped
- Nuxt: `autoLastmod`; Nuxt rendered on each visit (with Nitro) visits its own pages to find their images
  (`server/routes/__sitemap__/pages.get.ts`), a product or an article added later shows up by itself
- Node.js servers of the site: Astro, Next and Qwik read their pages folder too; SvelteKit's `sitemap.xml` route gives the
  images of each page
- Site without build (HTML / CSS / JS): `start.bat` then `B` writes its `sitemap.xml` and `robots.txt` (new
  `.env.production` with the address of the site); the `.htaccess` of the static sites never serves `.env*` files

### API (every back end)
- `ResponseHelper.tooManyRequests` (429 with `Retry-After`), `RequestHelper.multipart` (form with files: `{ fields, files }`,
  no extra package, Express included) and `Controller.changed` (`{ id }` when a row changed, else 404), taken from the sites
- Symfony: `.env` now says `APP_ENV=prod` (dev stays in dev with `.env.local`): online it was running in dev and never read
  `.env.prod.local`
- Laravel: online, `.env.production` goes up renamed `.env` (Laravel only reads it), never the `.env` of dev
- CORS: the origin of the site is its domain alone, never with a folder

### Stacks (published by the robot, no new version of the app needed)
- `.gitignore`: only `backend/uploads/` and `frontend/uploads/` are ignored, no longer every folder named `uploads`
  (a route of the site in `server/routes/uploads/` was left out of Git, and missing once online)
- Limits of tries (`RateLimitHelper.php`, `SecurityHelper.js`): counters untouched for a day are removed from time to time,
  so `var/rate-limit/` (or the memory of a JavaScript API) never grows over the years

## [1.3.0] - 2026-11-06

Every new project is ready for the tests of a site before it goes online (the "recette": 39 checks of security,
accessibility, SEO and speed). Until now each site had to add these things by hand.

### Sites (every front)
- New `base/accessibility.css`: `.visually-hidden` (an `<h1>` hidden on screen but read by search engines and screen readers),
  keyboard focus always visible (`:focus-visible`), touch areas of 24 px at least on touch screens (`pointer: coarse`, nothing
  changes with a mouse), `.text-long` (about 80 characters per line)
- The footer keeps clear of the floating buttons on phones and tablets
- Every link of the base components has a `title`, every image a filled `alt` and a `title` (logo, home link, 404 page, DC Scaffold design)
- `.htaccess` of the site: security headers (nosniff, X-Frame-Options, Referrer-Policy, HSTS over HTTPS), no `X-Powered-By`,
  images and fonts kept a week by the browser (pages, scripts and styles still never cached)
- Private pages left out of `sitemap.xml` and forbidden in `robots.txt`: `privateRoutes` in `nuxt.config.ts` (Nuxt),
  `PRIVATE_ROUTES` in `scripts/sitemap.mjs` (the other fronts)
- Nuxt: the `vite.esbuild` option is gone (with Nuxt 4.6+, built with Rolldown, it gave hydration errors on the pages)

### API (every back end)
- Security headers on every answer, errors included, without `X-Powered-By`: `.htaccess` and `expose_php = Off` (PHP),
  the server (Express, NestJS), a middleware (Nitro, AdonisJS), the shared handler (API inside the site)
- Slim and PHP: `SecurityHelper::sendHeaders()` at the top of `public/index.php`, so the headers are there with any server
  (Apache, Nginx, `php -S`)
- PHP: `RateLimitHelper` (limit of tries: contact form, failed logins, forgotten password; the visitor is the last address of
  `X-Forwarded-For`), `FileTypeHelper` (real type of a file sent, read in its content), `LengthHelper` (a text too long gets a
  400 error instead of a 500 from the database), `uploads/.htaccess` (a file sent is never run as code, Slim and PHP)
- JavaScript: `SecurityHelper` with the same tools (headers, limit of tries, real type of a file, length of the texts)
- Express and NestJS trust one proxy (the host): `req.ip` and `req.secure` are those of the visitor

### API inside the site (Node.js server)
- `www.` is sent to the address without `www.` (301, path and parameters kept), not every host does it, and the security
  headers are on every page: Nuxt (`server/middleware/`), Next.js (`headers()` and `redirects()` of `next.config.mjs`),
  SvelteKit (new `server.js` in front of `build/handler.js`, started by `npm start`), Qwik (`src/entry.node-server.tsx`).
  Astro serves its prerendered pages itself: the host does it there

### Every project
- `start.bat` then `K` (backup) and `O` (restore): the MySQL database of Docker, the SQLite files and the files sent
  (`uploads/`) into `backups/<date-time>/` (never in Git), and back
- `.gitignore`: `uploads/` keeps its `.htaccess`, `backups/` is ignored
- README and guides of the project: new "Security" and "Accessibility" sections, private pages, `K` / `O`

### Compatibility robot
- Stops at once when a file of `shared/i18n/` has two keys that differ only by case: PowerShell cannot read such a file,
  and every project created in that language would keep its English comments

## [1.2.1] - 2026-11-04

### Back ends
- Slim and PHP: the settings are loaded by `config/env.php` (`loadEnv()`): `.env` when it exists, otherwise `.env.production`. Nothing to set on the server any more: send `.env.production`, never the `.env`. The `SetEnv APP_ENV` of the `.htaccess` is gone (it also overrode the `.env` of Laravel and Symfony). Same loading as the projects Battle Arena and David Noguier

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
- The GitHub issue of the compatibility robot shows the end of the log of every failure: the cause without opening the job

### Going online, step by step
- Every project has a "Going online" section in its README, and the same steps under the `start.bat` menu, for the chosen front and back end: online settings of the API, address of the API for the site (before the build), what to upload for the site, what to upload for the API
- With a separate API (PHP, Express...), it says it plainly: the build of the site does not contain the API, they are two separate uploads (often two addresses); with an API inside the site, one server and one upload

### Fixes
- `start.bat` offers only the production build that fits the project: Nuxt with a separate API (PHP or other) or without one gets `G` (static site) only, no more `B` (`nuxt build`, a Node.js server that made no sense next to a PHP API); Nuxt + Nitro gets `B` only (site + API in one Node.js server). Every option says what it produces
- Nitro (separate): `npm run dev` only answered on `::1` (IPv6) since the latest Nitro 2, so `http://127.0.0.1` and the compatibility robot could not reach it; it now listens on every address, like Express and NestJS
- MySQL in Docker starts on Linux and macOS: it could not write its error log in the `mysql/logs/` folder of the project (owned by the user of the computer) and stopped at once; Windows was not affected
- MySQL in Docker is "healthy" only once really ready: on the first start, the API (and the compatibility robot) could reach it while MySQL was still creating the database, and get an error
- Docker image of the PHP back ends: works with PHP 8.5 (OPcache is built into PHP since 8.5 and could no longer be installed); the Docker images now use **PHP 8.5**, validated by the compatibility robot

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
