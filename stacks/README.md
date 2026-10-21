# Stacks — ajouter ses propres fronts et back ends

*[English](README.en.md)*

Chaque dossier de `fronts/` ou `backs/` qui contient un `stack.json` apparaît automatiquement dans le menu de DC Scaffold.
Pour ajouter un framework, copie le dossier le plus proche (par exemple `fronts/vue` pour un front Vite), renomme-le et adapte son `stack.json`. Aucun code à modifier, aucune recompilation.

Poussés sur `main`, les stacks sont testés par le robot de compatibilité puis publiés dans le catalogue en ligne : tous les DC Scaffold installés les reçoivent à leur prochaine ouverture. `version.txt` (la version des stacks) est mis à jour par le robot.

```
stacks/
├── common/          fichiers de tous les projets (start.bat, start.ps1, README, .gitignore)
├── infra/           docker/ (services assemblés dans docker-compose.yml), mysql/, nginx/, versions.json (PHP et MySQL de Docker, tenus à jour par le robot)
├── shared/          code commun à plusieurs stacks :
│                    front-core (textes, cookies, SEO), front-vue / front-react / front-svelte / front-astro / front-dom
│                    (composants par framework), front-css (style simple), dc-scaffold (design de DC Scaffold : thème, polices, textes de l'accueil),
│                    front-design (dc-scaffold.config.js et scripts/design.mjs), front-spa, php-core, js-core, client/api.js, docs (README.md du projet), i18n (commentaires en français)
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

| Champ | Rôle |
| ----- | ---- |
| `label`, `order`, `description` | Affichage dans le menu (ordre croissant, description en `fr` / `en`) |
| `requires` | Outils vérifiés au démarrage : `node`, `composer`, `docker` |
| `versions` | Paquets vérifiés sur npm ou Packagist. `stable` = version validée ; une nouvelle version majeure est proposée, jamais imposée. `token` rend la version utilisable dans les fichiers (`^{{V_VUE}}`). `pin` remet le paquet sur la version stable si l'outil de création a installé une majeure plus récente. |
| `steps` | Étapes exécutées dans l'ordre (voir ci-dessous) |

Fronts uniquement :

| Champ | Rôle |
| ----- | ---- |
| `api` | Comment ce front lit l'URL de l'API, pour générer `api.js` : `file`, `imports`, `base`, `source`, `isDev`, `usage` |
| `publicDir` | Dossier copié tel quel au build, qui reçoit le `.htaccess` (`""` = racine de `frontend/`) |
| `docker` | `true` = servi par nginx dans Docker en développement (front sans build) |
| `port` | Port de développement par défaut du framework (5173 pour Vite, 4321 pour Astro...) |
| `layout` | Chemins écrits dans le `README.md` du projet : `src`, `css`, `public`, `storeFile`, `storeLib`, `layoutFile` (AppShell), `header`, `footer`, `page`, `pageCopy`, `pageHero` (haut de page réutilisable, par défaut `components/ui/PageHero/`), `textUsage`, `prefsUsage` (lire un choix du visiteur, par défaut `userPreferences.preferences.maps`), `env` ou `siteFile`, `omitGuide` (lignes à retirer), `designIndexExt` (extension de `dc-scaffold/index`, `.js` par défaut), `designRuntime` (`true` : l'interrupteur du design est lu dans le navigateur, sans build) |

Dans les fichiers des fronts, un bloc entre `@two-languages` et `@end-two-languages` (dans un commentaire) n'est gardé que pour un site en deux langues, un bloc entre `@one-language` et `@end-one-language` que pour un site en une langue. Les lignes des marqueurs sont retirées.

Avec une seule langue, il n'y a pas de système de traduction : chaque `t('clé')`, `t(lang, 'clé')` (Qwik), `getTranslation('clé')` et `data-i18n="clé"` des fichiers du front est remplacé par son texte (pris dans `shared/front-core/plugins/translations` et `shared/dc-scaffold/texts`), dans la syntaxe du fichier, et `plugins/lang`, `plugins/translations` et `useLang` ne sont pas créés. Dans un bloc `@one-language`, `{{TEXT:clé}}` (texte brut) et `{{TEXT_JS:clé}}` (texte pour une chaîne JavaScript entre apostrophes) donnent le texte d'une clé.

Design : chaque front copie `shared/dc-scaffold` dans `<src>/dc-scaffold/` (avec ses `Hero`, `NextSteps` et `index.js` propres au framework) et `shared/front-design` à la racine du front. `frontend/dc-scaffold.config.js` (`design: true` ou `false`) est lu par `scripts/design.mjs` avant `npm run dev` et chaque build (`predev`, `prebuild`...) : il écrit `<src>/design.js` (qui exporte `design` et `welcome`, les sections de l'accueil de DC Scaffold, ou `null`) et `<css>/design.css` (qui importe `dc-scaffold/theme.css`, ou rien). Avec `false`, rien du dossier `dc-scaffold` n'entre dans le build. Jetons : `{{DESIGN_FOLDER}}`, `{{DESIGN_JS}}`, `{{DESIGN_CSS}}`, `{{FRONT_DESIGN_CONFIG}}`.

Back ends uniquement :

| Champ | Rôle |
| ----- | ---- |
| `runtime` | `php` (Apache + PHP dans Docker), `node` (lancé sur la machine, sans Docker), `none` |
| `database` | `true` = toujours MySQL (back ends PHP), `"optional"` = MySQL ou SQLite au choix (back ends JavaScript), `false` = jamais |
| `controllers`, `controllerExt`, `controllerFile` | Dossier des contrôleurs et extension, pour les guides ; `controllerFile` : nom du contrôleur d'exemple (par défaut `ProductsController.<ext>`) |
| `drivers` | Accès à la base proposé au choix, ex. `["mysqli", "pdo"]` : la valeur choisie remplit `{{DB_DRIVER}}` (`{ "copy": "@shared/php-db/{{DB_DRIVER}}" }`) |
| `noDatabase` | Texte affiché pour « aucune base » quand le back end a sa propre solution (`fr` / `en`, ex. SQLite pour Laravel) |
| `fallbackDatabase` | Nom de cette solution dans le menu et le récapitulatif (ex. `"SQLite"`) |
| `phpExtensions` | Extensions PHP proposées à l'activation dans le `php.ini` local (Composer), ex. `["fileinfo", "mbstring"]` |
| `nodeEngine` | Version minimale de Node.js demandée par le stack, ex. `">=22.13.0"` (vérifiée et mise à jour au démarrage) |

Docker n'est ajouté que si nécessaire : back end `php`, base MySQL ou front `"docker": true`.

## Étapes (`steps`)

Toutes acceptent une condition `when` :

| `when` | L'étape s'exécute si... |
| ------ | ----------------------- |
| `api` / `noApi` | le projet a un back end / n'en a pas |
| `front` / `noFront` | le projet a un front / n'en a pas |
| `db` / `noDb` | MySQL a été choisi / aucune base |
Les chemins sont relatifs à `frontend/` (front) ou `backend/` (back end), sauf mention contraire.

| Étape | Exemple | Effet |
| ----- | ------- | ----- |
| `run` | `{ "run": ["npm", "create", "vite@latest", "{{DIR}}"], "in": "root" }` | Lance une commande (`npm`, `npx`, `composer` ou autre). `"in": "root"` = depuis la racine du projet. |
| `check` | `{ "check": "package.json" }` | Arrête si le fichier n'existe pas (création échouée) |
| `copy` | `{ "copy": "files" }`, `{ "copy": "@shared/php-core", "to": "src/Core" }` | Copie un dossier du stack, ou de `stacks/` avec `@` |
| `remove` | `{ "remove": ["next.config.*"] }` | Supprime des fichiers |
| `replace` | `{ "replace": { "file": "vite.config.js", "find": "regex", "with": "texte" } }` | Remplace la première correspondance |
| `insert` | `{ "insert": { "file": "vite.config.js", "after": "defineConfig\\(\\{", "text": "  server: { port: {{APP_PORT}} }," } }` | Ajoute du texte après une correspondance, en gardant l'indentation |
| `npm` | `{ "npm": { "set": { "scripts.dev": "vite --port {{APP_PORT}}" }, "delete": ["devDependencies.x"] } }` | Modifie `package.json` |
| `env` | `{ "env": { "file": ".env", "from": ".env.example", "values": { "DB_HOST": "db" } } }` | Crée ou complète un fichier d'environnement |
| `flatten` | `{ "flatten": "app" }` | Remonte le contenu d'un sous-dossier (Nuxt 4 : plus de `app/app`) |
| `touch` | `{ "touch": "database/database.sqlite", "when": "noDb" }` | Crée un fichier vide s'il n'existe pas |

## Variables utilisables dans les fichiers et les étapes

`{{PROJECT_NAME}}`, `{{SLUG}}`, `{{DIR}}` (`frontend` ou `backend`), `{{APP_PORT}}`, `{{API_PORT}}`, `{{PMA_PORT}}`, `{{DB_HOST_PORT}}`,
`{{DB_NAME}}`, `{{DB_PASS}}`, `{{DB_DRIVER}}` (`mysqli` / `pdo`), `{{DB_SERVER_VERSION}}`, `{{MYSQL_VERSION}}`, `{{PHP_VERSION}}` (versions de `infra/versions.json`), les `token` de `versions` (`{{V_VUE}}`...),
`{{PROJECT_NAME_JS}}` (nom dans une chaîne JavaScript), `{{LANGUAGES_JS}}`, `{{DEFAULT_LANG}}`, `{{NEW_SECRET}}` et `{{NEW_LARAVEL_KEY}}` (une nouvelle valeur aléatoire à chaque utilisation).

## Fichiers d'un stack

- `files/` : copié dans `frontend/` ou `backend/` (selon les étapes `copy`)
- `files-api/` (fronts) : par convention, les fichiers utiles seulement avec un back end (`.env` de l'URL de l'API)
- `doc.md` : partie du `README.md` du projet propre à ce stack. Chaque ligne commence par sa langue, `[fr]` ou `[en]` ;
  `[fr-api]` / `[en-api]` (fronts) : seulement quand il y a un back end. `[fr-one-language]` / `[fr-two-languages]` (et `en-...`) : seulement pour un site en une / deux langues. Les lignes sans balise (code, arborescence) restent dans les deux langues.
- `routing.htaccess` (fronts) : règles de réécriture insérées dans le `.htaccess` de production

## Commentaires en français

Les fichiers des stacks sont commentés en anglais. Quand DC Scaffold tourne en français, chaque commentaire est remplacé
par sa traduction de `shared/i18n/fr.json` (`comments` : texte anglais exact → texte français ; `strings` : messages de `start.ps1`).
Un commentaire absent du fichier reste en anglais : après avoir ajouté ou modifié des commentaires, ajoute leur traduction.

## Garder la même architecture

Un nouveau back end doit fournir les mêmes briques que les autres : contrôleurs avec `getAll` / `getOne` / `create` / `update` / `delete`,
`ResponseHelper`, `RequestHelper`, `DatabaseHelper`, routes automatiques, CORS limité à `APP_BASE_URL`, erreurs au format JSON commun.
Le plus simple : partir de `backs/express` (Node.js) ou `backs/php` (PHP) et réutiliser `shared/js-core` ou `shared/php-core`.
