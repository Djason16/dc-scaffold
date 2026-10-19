# Stacks — adding your own fronts and back ends

*[Français](README.md)*

Every folder in `fronts/` or `backs/` that contains a `stack.json` shows up automatically in the DC Scaffold menu.
To add a framework, copy the closest folder (for instance `fronts/vue` for a Vite front), rename it and adapt its `stack.json`. No code to change, no rebuild.

Once pushed to `main`, the stacks are tested by the compatibility robot and published in the online catalog: every installed DC Scaffold gets them the next time it opens. `version.txt` (the version of the stacks) is updated by the robot.

```
stacks/
├── common/          files of every project (start.bat, start.ps1, README, .gitignore)
├── infra/           docker/ (services assembled into docker-compose.yml), mysql/, nginx/, versions.json (PHP and MySQL of Docker, kept up to date by the robot)
├── shared/          code shared by several stacks:
│                    front-core (texts, cookies, SEO), front-vue / front-react / front-svelte / front-astro / front-dom
│                    (components per framework), front-css (simple style), dc-scaffold (DC Scaffold design: theme, fonts, texts of the welcome page),
│                    front-design (dc-scaffold.config.js and scripts/design.mjs), front-spa, php-core, js-core, client/api.js, docs (README.md of the project), i18n (comments in French)
├── fronts/<id>/     stack.json, doc.md, routing.htaccess, files/, files-api/
└── backs/<id>/      stack.json, doc.md, files/
```

## stack.json

```json
{
    "label": "Vue",
    "order": 40,
    "description": { "fr": "Vue + Vite", "en": "Vue + Vite" },
    "requires": ["node"],
    "versions": [
        { "package": "vue", "registry": "npm", "stable": "3", "token": "V_VUE", "pin": ["dependencies.vue"] }
    ],
    "steps": [
        { "run": ["npm", "create", "vue@latest", "{{DIR}}", "--", "--bare", "--router"], "in": "root" },
        { "check": "package.json" },
        { "copy": "files-api", "when": "api" }
    ]
}
```

| Field | Purpose |
| ----- | ------- |
| `label`, `order`, `description` | Menu display (ascending order, description in `fr` / `en`) |
| `requires` | Tools checked (and installed) at startup: `node`, `composer`, `docker` |
| `versions` | Packages checked on npm or Packagist. `stable` = tested version; a newer major is offered, never forced. `token` makes the version usable in files (`^{{V_VUE}}`). `pin` sets the package back to the stable version when the create tool installed a newer major. |
| `steps` | Steps run in order (see below) |

Fronts only:

| Field | Purpose |
| ----- | ------- |
| `api` | How this front reads the API URL, used to generate `api.js`: `file`, `imports`, `base`, `source`, `isDev`, `usage` |
| `publicDir` | Folder copied as-is on build, receives the `.htaccess` (`""` = root of `frontend/`) |
| `docker` | `true` = served by nginx in Docker during development (front without build) |
| `port` | Default development port of the framework (5173 for Vite, 4321 for Astro...) |
| `layout` | Paths written into the `README.md` of the project: `src`, `css`, `public`, `storeFile`, `storeLib`, `layoutFile` (AppShell), `header`, `footer`, `page`, `pageCopy`, `pageHero` (reusable top of page, `components/ui/PageHero/` by default), `textUsage`, `prefsUsage` (reading a choice of the visitor, `userPreferences.preferences.maps` by default), `env` or `siteFile`, `omitGuide` (lines to remove), `designIndexExt` (extension of `dc-scaffold/index`, `.js` by default), `designRuntime` (`true`: the design switch is read in the browser, no build) |

In front files, a block between `@two-languages` and `@end-two-languages` (in a comment) is kept only for a two-language site, a block between `@one-language` and `@end-one-language` only for a one-language site. The marker lines are removed.

With one language there is no translation system: every `t('key')`, `getTranslation('key')` and `data-i18n="key"` of the front files is replaced by its text (taken from `shared/front-core/plugins/translations` and `shared/dc-scaffold/texts`), in the syntax of the file, and `plugins/lang`, `plugins/translations` and `useLang` are not created. In an `@one-language` block, `{{TEXT:key}}` (plain text) and `{{TEXT_JS:key}}` (text for a single-quoted JavaScript string) give the text of a key.

Design: every front copies `shared/dc-scaffold` into `<src>/dc-scaffold/` (with its own `Hero`, `NextSteps` and `index.js` for the framework) and `shared/front-design` to the root of the front. `frontend/dc-scaffold.config.js` (`design: true` or `false`) is read by `scripts/design.mjs` before `npm run dev` and every build (`predev`, `prebuild`...): it writes `<src>/design.js` (exporting `design` and `welcome`, the sections of the DC Scaffold welcome page, or `null`) and `<css>/design.css` (importing `dc-scaffold/theme.css`, or nothing). With `false`, nothing of the `dc-scaffold` folder goes into the build. Tokens: `{{DESIGN_FOLDER}}`, `{{DESIGN_JS}}`, `{{DESIGN_CSS}}`, `{{FRONT_DESIGN_CONFIG}}`.

Back ends only:

| Field | Purpose |
| ----- | ------- |
| `runtime` | `php` (Apache + PHP in Docker), `node` (runs on the machine, no Docker), `none` |
| `database` | `true` = always MySQL (PHP back ends), `"optional"` = MySQL or SQLite (JavaScript back ends), `false` = never |
| `controllers`, `controllerExt` | Folder and extension of the controllers, for the guides |
| `drivers` | Database access offered as a choice, e.g. `["mysqli", "pdo"]`: the chosen value fills `{{DB_DRIVER}}` (`{ "copy": "@shared/php-db/{{DB_DRIVER}}" }`) |
| `noDatabase` | Text shown for "no database" when the back end has its own fallback (`fr` / `en`, e.g. SQLite for Laravel) |
| `fallbackDatabase` | Name of that fallback in the menu and the summary (e.g. `"SQLite"`) |
| `phpExtensions` | PHP extensions offered for activation in the local `php.ini` (Composer), e.g. `["fileinfo", "mbstring"]` |
| `nodeEngine` | Minimum Node.js version the stack needs, e.g. `">=22.13.0"` (checked and updated at startup) |

Docker is only added when needed: `php` back end, MySQL database or `"docker": true` front.

## Steps

Every step accepts a `when` condition:

| `when` | The step runs when... |
| ------ | --------------------- |
| `api` / `noApi` | the project has a back end / has none |
| `front` / `noFront` | the project has a front / has none |
| `db` / `noDb` | MySQL was chosen / no database |

Paths are relative to `frontend/` (front) or `backend/` (back end) unless stated otherwise.

| Step | Example | Effect |
| ---- | ------- | ------ |
| `run` | `{ "run": ["npm", "create", "vite@latest", "{{DIR}}"], "in": "root" }` | Runs a command (`npm`, `npx`, `composer` or other). `"in": "root"` = from the project root. |
| `check` | `{ "check": "package.json" }` | Stops when the file does not exist (creation failed) |
| `copy` | `{ "copy": "files" }`, `{ "copy": "@shared/php-core", "to": "src/Core" }` | Copies a folder of the stack, or of `stacks/` with `@` |
| `remove` | `{ "remove": ["next.config.*"] }` | Deletes files |
| `replace` | `{ "replace": { "file": "vite.config.js", "find": "regex", "with": "text" } }` | Replaces the first match |
| `insert` | `{ "insert": { "file": "vite.config.js", "after": "defineConfig\\(\\{", "text": "  server: { port: {{APP_PORT}} }," } }` | Adds text after a match, keeping the indentation |
| `npm` | `{ "npm": { "set": { "scripts.dev": "vite --port {{APP_PORT}}" }, "delete": ["devDependencies.x"] } }` | Edits `package.json` |
| `env` | `{ "env": { "file": ".env", "from": ".env.example", "values": { "DB_HOST": "db" } } }` | Creates or completes an environment file |
| `flatten` | `{ "flatten": "app" }` | Moves a subfolder's content up (Nuxt 4: no more `app/app`) |
| `touch` | `{ "touch": "database/database.sqlite", "when": "noDb" }` | Creates an empty file when missing |

## Variables usable in files and steps

`{{PROJECT_NAME}}`, `{{SLUG}}`, `{{DIR}}` (`frontend` or `backend`), `{{APP_PORT}}`, `{{API_PORT}}`, `{{PMA_PORT}}`, `{{DB_HOST_PORT}}`,
`{{DB_NAME}}`, `{{DB_PASS}}`, `{{DB_DRIVER}}` (`mysqli` / `pdo`), `{{DB_SERVER_VERSION}}`, `{{MYSQL_VERSION}}`, `{{PHP_VERSION}}` (versions of `infra/versions.json`), the `versions` tokens (`{{V_VUE}}`...),
`{{PROJECT_NAME_JS}}` (name inside a JavaScript string), `{{LANGUAGES_JS}}`, `{{DEFAULT_LANG}}`, `{{NEW_SECRET}}` and `{{NEW_LARAVEL_KEY}}` (a new random value each time they are used).

## Files of a stack

- `files/`: copied into `frontend/` or `backend/` (through `copy` steps)
- `files-api/` (fronts): by convention, files only useful with a back end (`.env` with the API URL)
- `doc.md`: the part of the project `README.md` specific to this stack. Each line starts with its language, `[fr]` or `[en]`;
  `[fr-api]` / `[en-api]` (fronts): only when there is a back end. `[fr-one-language]` / `[fr-two-languages]` (and `en-...`): only for a site in one / two languages. Lines without a tag (code, folder tree) stay in both languages.
- `routing.htaccess` (fronts): rewrite rules inserted into the production `.htaccess`

## Comments in French

The stack files are commented in English. When DC Scaffold runs in French, each comment is replaced by its translation from
`shared/i18n/fr.json` (`comments`: exact English text → French text; `strings`: messages of `start.ps1`).
A comment missing from the file stays in English: after adding or changing comments, add their translation.

## Keeping the same architecture

A new back end must provide the same building blocks as the others: controllers with `getAll` / `getOne` / `create` / `update` / `delete`,
`ResponseHelper`, `RequestHelper`, `DatabaseHelper`, automatic routes, CORS limited to `APP_BASE_URL`, errors in the shared JSON format.
The easiest way: start from `backs/express` (Node.js) or `backs/php` (PHP) and reuse `shared/js-core` or `shared/php-core`.
