# 10. Ajouter un stack

[← Sommaire](README.md)

Un **stack** est un front ou un back end : un dossier de `stacks/fronts/` ou `stacks/backs/` avec un `stack.json`.
Il apparaît **tout seul** dans la fenêtre et dans la console : aucun code à modifier, aucune recompilation du setup.

Référence courte : [`stacks/README.md`](../stacks/README.md) ([English](../stacks/README.en.md)).

## Où le mettre

| Dossier | Pour qui |
| ------- | -------- |
| `stacks/fronts/<id>/`, `stacks/backs/<id>/` | Dans le dépôt : testé par le robot, publié dans le catalogue, reçu par tous les DC Scaffold |
| `%APPDATA%\DC Scaffold\stacks\fronts\<id>\` (ou `backs\`) | Sur ton ordinateur seulement ; même `id` qu'un stack de DC Scaffold = le remplace. Gardé par les mises à jour |

Le plus simple : **copier le dossier le plus proche** (`fronts/vue` pour un front Vite, `backs/express` pour Node.js,
`backs/php` pour PHP), le renommer et adapter son `stack.json`.

## Les fichiers d'un stack

```
stacks/fronts/<id>/
├── stack.json         description et étapes de création
├── doc.md             partie du README du projet propre à ce stack
├── routing.htaccess   règles de réécriture du .htaccess de production (fronts)
├── files/             fichiers copiés dans le projet
└── files-api/         fichiers utiles seulement avec une API séparée (.env de l'adresse de l'API)

stacks/backs/<id>/
├── stack.json, doc.md, files/
└── inside/<front>/    fichiers et doc quand ce back end est rangé dans un front (voir plus bas)
```

Code partagé entre stacks, dans `stacks/shared/` : `front-core` (textes, cookies, SEO), `front-vue`, `front-react`,
`front-svelte`, `front-astro`, `front-angular`, `front-dom` (composants par framework), `front-css` (style simple),
`dc-scaffold` (design de DC Scaffold), `front-design` (`dc-scaffold.config.js`, `scripts/design.mjs`), `front-scripts`
(`scripts/sitemap.mjs`), `front-spa`, `front-public`, `php-core`, `php-common` (Dockerfile, php.ini), `php-db` (mysqli / PDO),
`js-core` (`DatabaseHelper`, `RouteDiscovery`), `client/api.js`, `docs` (modèles du README du projet), `i18n` (commentaires en français).

## `stack.json` : les champs

### Pour tous

| Champ | Rôle |
| ----- | ---- |
| `label` | Nom affiché : texte simple ou `{ "fr": ..., "en": ... }` |
| `order` | Position dans la liste (croissant) |
| `description` | Phrase de la carte : texte ou `{ "fr", "en" }` |
| `requires` | Outils vérifiés : `node`, `composer`, `docker` |
| `versions` | Paquets vérifiés sur npm ou Packagist : `package`, `registry` (`npm` / `packagist`), `stable` (version validée, mise à jour par le robot), `token` (utilisable dans les fichiers : `^{{V_VUE}}`), `pin` (remet le paquet sur la version validée si l'outil de création a installé une majeure plus récente) |
| `steps` | Étapes de création, dans l'ordre (voir plus bas) |
| `vscode` | Extensions VS Code conseillées, ex. `["Vue.volar"]` |

### Fronts

| Champ | Rôle |
| ----- | ---- |
| `port` | Port de développement par défaut |
| `api` | Comment ce front lit l'adresse de l'API, pour générer `api.js` : `file` (où l'écrire), `imports`, `base` (expression de l'adresse), `source` (variable), `isDev`, `usage` |
| `publicDir` | Dossier copié tel quel au build, qui reçoit le `.htaccess` (`""` = racine de `frontend/`) |
| `docker` | `true` = servi par nginx dans Docker en développement (front sans build) |
| `deploy` | Mise en ligne : `key` (touche de `start.bat` qui produit le site, `B` ou `G`) et `dir` (dossier à envoyer, depuis `frontend/`) ; `key` vide = `frontend/` envoyé tel quel |
| `layout` | Chemins écrits dans le README du projet : `src`, `css`, `public`, `pages`, `page`, `pageCopy`, `storeFile`, `storeLib`, `layoutFile`, `header`, `footer`, `pageHero`, `textUsage`, `prefsUsage`, `env` ou `siteFile`, `homeSections`, `omitGuide`, `designIndexExt`, `designRuntime`, `designClientTexts` |

### Back ends

| Champ | Rôle |
| ----- | ---- |
| `runtime` | `php` (Apache + PHP dans Docker), `node` (sur la machine), `none` |
| `database` | `true` = toujours MySQL, `"optional"` = MySQL ou SQLite, `false` = jamais |
| `drivers` | Accès proposé au choix, ex. `["mysqli", "pdo"]` → `{{DB_DRIVER}}` |
| `noDatabase`, `fallbackDatabase` | Texte et nom de la solution sans MySQL (ex. SQLite) |
| `phpExtensions` | Extensions PHP proposées à l'activation dans le `php.ini` local |
| `nodeEngine` | Version minimale de Node.js, ex. `">=22.13.0"` |
| `controllers`, `controllerExt`, `controllerFile` | Dossier, extension et nom de l'exemple de contrôleur, pour le README |
| `guide` | Chemins et exemples du README : `helpers`, `middleware`, `entry`, `envDev`, `envProd`, `custom`, `success`, `body`, `missing`, `db` |
| `online` | Mise en ligne de l'API, une phrase `{ "fr", "en" }` (jetons acceptés) : dernière étape de « Mettre en ligne » |
| `inside` | Fronts qui contiennent déjà ce back end (voir plus bas) |
| `onlyInside` | `true` = n'existe que dans un front (« API dans le site ») : proposé avec ces fronts seulement |

## Les étapes (`steps`)

Les chemins sont relatifs à `frontend/` (front) ou `backend/` (back end). Chaque étape accepte une condition `when`.

| Étape | Exemple | Effet |
| ----- | ------- | ----- |
| `run` | `{ "run": ["npm", "create", "vite@latest", "{{DIR}}"], "in": "root" }` | Lance une commande (`npm`, `npx`, `composer` ou autre). `"in": "root"` = depuis la racine du projet. `"optional": true` = un échec ne stoppe pas |
| `check` | `{ "check": "package.json" }` | Arrête si le fichier n'existe pas (création ratée) |
| `copy` | `{ "copy": "files" }`, `{ "copy": "@shared/js-core", "to": "utils" }` | Copie un dossier du stack, ou de `stacks/` avec `@` |
| `remove` | `{ "remove": ["next.config.*"] }` | Supprime des fichiers ou des dossiers |
| `replace` | `{ "replace": { "file": "vite.config.js", "find": "regex", "with": "texte" } }` | Remplace la première correspondance |
| `insert` | `{ "insert": { "file": "vite.config.js", "after": "defineConfig\\(\\{", "text": "..." } }` | Ajoute du texte après une correspondance, en gardant l'indentation |
| `npm` | `{ "npm": { "set": { "scripts.dev": "vite" }, "delete": ["devDependencies.x"] } }` | Modifie `package.json` |
| `env` | `{ "env": { "file": ".env", "from": ".env.example", "values": { "DB_HOST": "db" } } }` | Crée ou complète un `.env` |
| `flatten` | `{ "flatten": "app" }` | Remonte le contenu d'un sous-dossier |
| `touch` | `{ "touch": "database/database.sqlite" }` | Crée un fichier vide |

| `when` | L'étape s'exécute si... |
| ------ | ----------------------- |
| `api` / `noApi` | le projet a un back end / n'en a pas |
| `front` / `noFront` | le projet a un front / n'en a pas |
| `db` / `noDb` | MySQL a été choisi / pas de MySQL |
| `separateApi` | le back end est dans `backend/` |
| `insideApi` / `noInsideApi` | le back end est rangé dans le front / il ne l'est pas (y compris sans back end) |

**Attention aux `replace` sur des commentaires** : les commentaires sont traduits **avant** les étapes. Pour remplacer
un commentaire, vise sa position (par exemple `(?m)^//[^\n]*\n(?=export default)`) plutôt que son texte anglais.

## Les jetons

Utilisables dans les fichiers copiés et dans les étapes :

| Jeton | Valeur |
| ----- | ------ |
| `{{PROJECT_NAME}}`, `{{SLUG}}`, `{{PROJECT_NAME_JS}}`, `{{PROJECT_NAME_PS}}` | Nom du projet, nom de dossier, nom dans une chaîne JavaScript / PowerShell |
| `{{DIR}}` | `frontend` ou `backend` |
| `{{APP_PORT}}`, `{{API_PORT}}`, `{{PMA_PORT}}`, `{{DB_HOST_PORT}}` | Ports |
| `{{DB_NAME}}`, `{{DB_PASS}}`, `{{DB_DRIVER}}`, `{{DB_SERVER_VERSION}}` | Base de données |
| `{{MYSQL_VERSION}}`, `{{PHP_VERSION}}`, `{{PHP_PLATFORM}}` | Versions des images Docker |
| `{{V_...}}` | Les `token` de `versions` |
| `{{LANGUAGES_JS}}`, `{{DEFAULT_LANG}}` | Langues du site |
| `{{NEW_SECRET}}`, `{{NEW_LARAVEL_KEY}}` | Une nouvelle valeur aléatoire à chaque utilisation |
| `{{BACK_DIR}}`, `{{BACK_ROOT}}` | Dossier du code de l'API (`backend` ou `frontend/server`...) et de son `.env` |

## Le `doc.md`

Partie du README du projet propre au stack. Chaque ligne commence par une balise ; elle n'est gardée que pour les projets concernés :

| Balise | Gardée... |
| ------ | --------- |
| `[fr]`, `[en]` | dans cette langue |
| `[fr-api]`, `[en-api]` | avec un back end (fronts) |
| `[fr-one-language]`, `[fr-two-languages]` | pour un site en une / deux langues |
| `[fr-separate]`, `[fr-inside]` | API séparée (ou aucune) / API dans le site |
| ligne sans balise | toujours (code, arborescence) |

Dans les guides communs (`shared/docs/guide/*-back.md`), les lignes `[<back>]`, `[docker]`, `[node]`, `[mysql]`, `[sqlite]`,
`[mysqli]`, `[pdo]`, `[front]`, `[inside]`, `[<back>-in-<front>]` suivent le même principe. Une ligne `<!-- ... -->` seule
est une note pour les auteurs, jamais copiée.

## Les commentaires en français

Les fichiers des stacks sont commentés **en anglais**. En français, chaque commentaire est remplacé par sa traduction de
`stacks/shared/i18n/fr.json` (`comments` : texte anglais exact → texte français ; `strings` : messages de `start.ps1`).
Un commentaire sans traduction reste en anglais : **après avoir ajouté ou modifié un commentaire, ajoute sa traduction.**

## Un back end dans un front (`inside`)

Quand un front a son propre serveur, un back end peut s'y ranger : pas de `backend/`, l'API sous `/api`, un seul serveur.
C'est le cas de Nitro dans Nuxt, et du back end « API dans le site » (`stacks/backs/site/`) dans Next.js, SvelteKit, Astro et Qwik.

```json
"inside": {
    "nuxt": {
        "dir": "server",
        "label": { "fr": "Nitro, API dans le site", "en": "Nitro, API inside the site" },
        "message": { "fr": "...", "en": "..." },
        "versions": [],
        "api": { "base": "'/api'", "source": "same site, under /api" },
        "steps": [ { "copy": "inside/nuxt/files" } ],
        "guide": { "helpers": "utils", "entry": "api/[...path].ts" },
        "online": { "fr": "...", "en": "..." },
        "doc": "inside/nuxt/doc.md"
    }
}
```

| Champ | Rôle |
| ----- | ---- |
| `dir` | Dossier de l'API dans `frontend/` |
| `label`, `message` | Nom dans le récapitulatif (« Nitro, API dans le site ») et phrase d'explication (console, fenêtre) |
| `versions` | Paquets propres à ce cas (ex. l'adaptateur Node.js) ; ceux du back end seul ne sont pas vérifiés |
| `api` | Remplace des champs de l'`api` du front pour `api.js` (l'adresse devient le site lui-même) |
| `steps` | Exécutées dans `frontend/` **après** celles du front ; `copy` part du dossier du back end |
| `guide` | Chemins du README, relatifs à `frontend/<dir>/` (`../` accepté) |
| `online`, `doc` | Mise en ligne et partie du README propres à ce cas |

Le back end « API dans le site » (`stacks/backs/site/`) est écrit par un script, pour ne pas répéter les étapes communes aux quatre
fronts : modifie `tools/stacks/site_stack.py`, puis `python tools/stacks/site_stack.py`.

## Garder la même architecture

Un nouveau back end doit fournir les mêmes briques : contrôleurs (`getAll`, `getOne`, `create`, `update`, `delete`),
`ResponseHelper`, `RequestHelper`, `DatabaseHelper`, routes automatiques, CORS limité à `APP_BASE_URL`, erreurs au
format JSON commun. Réutilise `shared/js-core` ou `shared/php-core`.

Un nouveau front doit avoir l'AppShell, le bandeau cookies, la page 404, le SEO, `sitemap.xml`, une ou deux langues et
l'interrupteur du design.

## Tester

```
.\DCScaffold.bat -Lang fr -Name test -Front <id> -Back none -SkipToolCheck -NoGit -Force
```

`DCScaffold.bat` lance le moteur du dépôt sans rien installer. Puis build et lancement dans le projet. Une fois poussé
sur `master`, le robot le teste à son tour (voir [11. Robot et catalogue](11-robot-et-catalogue.md)).
