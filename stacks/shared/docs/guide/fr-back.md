
## API (back end)

L'API est dans `{{BACK_DIR}}/`. Elle répond toujours en JSON : `{ "success": true, ... }` en cas de succès,
`{ "success": false, "error": "...", "type": "NOT_FOUND" }` en cas d'erreur (adresse inconnue, mauvaise méthode, plantage compris).

### Où sont les choses

- **Contrôleurs** (tes routes) : `{{BACK_CONTROLLERS_PATH}}/`
- **Helpers** (réponses, lecture des requêtes, base de données) : `{{BACK_HELPERS_PATH}}/`
- **Middlewares** (CORS, sessions, erreurs) : `{{BACK_MIDDLEWARE_PATH}}`
- **Démarrage** (middlewares, routes automatiques) : `{{BACK_ENTRY_PATH}}`
- **Réglages** : `{{BACK_ROOT}}/{{BACK_ENV_DEV}}` (développement) et `{{BACK_ROOT}}/{{BACK_ENV_PROD}}` (en ligne)

### Nouvelle route

Crée un contrôleur, par exemple `{{BACK_CONTROLLERS_PATH}}/{{BACK_CONTROLLER_FILE}}` (exemple complet juste en dessous).
Ses méthodes deviennent des routes toutes seules :

| Méthode | Route |
| ------- | ----- |
| `getAll` | `GET /products` |
| `getOne` | `GET /products/{id}` |
| `create` | `POST /products` |
| `update` | `PUT /products/{id}` |
| `delete` | `DELETE /products/{id}` |

- Le préfixe vient du nom du fichier : `ProductsController` → `/products`, `BlogPostsController` → `/blog-posts`
- Une autre route : `{{BACK_CUSTOM_ROUTE}}`
- Une méthode sans route reste privée : on ne peut pas l'appeler depuis le front
[inside] - L'API est sur la même adresse que le site, sous `/api` : `GET /products` répond sur http://localhost:{{APP_PORT}}/api/products

### Structure et exemple

{{BACK_DOC}}

### Lire la requête et répondre

- Ce que le front envoie : `{{BACK_BODY}}`
- Champs obligatoires : `{{BACK_MISSING}}` donne la liste de ceux qui manquent
- Répondre : `{{BACK_SUCCESS}}`
- Erreurs : `notFound`, `validationError`, `authError`, `forbidden`, `serverError` de `ResponseHelper`, toutes au même format

### Sécurité

Déjà en place, et vérifié par la recette d'un site avant sa mise en ligne :

[docker] - **En-têtes de sécurité** sur chaque réponse, erreurs comprises (nosniff, X-Frame-Options, Referrer-Policy, HSTS en HTTPS), sans `X-Powered-By` : `backend/.htaccess` et `expose_php = Off` dans `backend/php.ini` (Slim et PHP : aussi `SecurityHelper::sendHeaders()` au début de `public/index.php`, pour tout serveur)
[node] - **En-têtes de sécurité** sur chaque réponse, erreurs comprises (nosniff, X-Frame-Options, Referrer-Policy, HSTS en HTTPS), sans `X-Powered-By` : posés par le serveur avec `SecurityHelper.headers()`
[inside] - **En-têtes de sécurité** sur chaque réponse de l'API (nosniff, X-Frame-Options, Referrer-Policy, HSTS en HTTPS) avec `SecurityHelper.headers()`
[nitro-in-nuxt] - Aussi sur chaque page, et `www.` renvoyé vers l'adresse sans `www.` (tous les hébergeurs ne le font pas) : `server/middleware/security.ts` et `redirect-www.ts`
[site-in-next] - Aussi sur chaque page, et `www.` renvoyé vers l'adresse sans `www.` (tous les hébergeurs ne le font pas) : `headers()` et `redirects()` de `next.config.mjs`
[site-in-sveltekit] - Aussi sur chaque page, et `www.` renvoyé vers l'adresse sans `www.` (tous les hébergeurs ne le font pas) : `server.js`, lancé par `npm start`
[site-in-qwik] - Aussi sur chaque page, et `www.` renvoyé vers l'adresse sans `www.` (tous les hébergeurs ne le font pas) : `src/entry.node-server.tsx`
[site-in-astro] - Les pages pré-rendues sont servies directement par le serveur d'Astro : la redirection de `www.` et les en-têtes des pages se règlent chez l'hébergeur (ou devant, avec Nginx)
[docker] - **Limite d'essais** (contact, connexion ratée, mot de passe oublié) : `if (RateLimitHelper::tooMany('contact', 5, 600))` renvoie une erreur 429 ; le visiteur est la dernière adresse de `X-Forwarded-For` (celle du proxy de l'hébergeur)
[node] - **Limite d'essais** (contact, connexion ratée, mot de passe oublié) : `SecurityHelper.tooMany('contact', SecurityHelper.ip(...), 5, 600)` puis une erreur 429 ; le visiteur est la dernière adresse de `X-Forwarded-For`
[inside] - **Limite d'essais** (contact, connexion ratée, mot de passe oublié) : `SecurityHelper.tooMany('contact', SecurityHelper.ip(...), 5, 600)` puis une erreur 429 ; le visiteur est la dernière adresse de `X-Forwarded-For`
[docker] - **Fichiers envoyés** : vérifie leur vrai type avec `FileTypeHelper::isImage($path)` (lu dans le contenu, le type donné par le navigateur peut être truqué) et enregistre-les avec `FileTypeHelper::extension($path)` ; `uploads/.htaccess` empêche d'y lancer un script
[node] - **Fichiers envoyés** : vérifie leur vrai type avec `SecurityHelper.fileType(buffer)` (lu dans les premiers octets) et enregistre-les sous un nom choisi par l'API, jamais celui envoyé
[inside] - **Fichiers envoyés** : vérifie leur vrai type avec `SecurityHelper.fileType(buffer)` (lu dans les premiers octets) et enregistre-les sous un nom choisi par l'API, jamais celui envoyé
[docker] - **Textes trop longs** : `LengthHelper::tooLong($data, ['name' => 100, 'message' => 5000])` donne une erreur 400 claire au lieu d'une erreur 500 de la base
[node] - **Textes trop longs** : `SecurityHelper.tooLong(data, { name: 100, message: 5000 })` donne une erreur 400 claire au lieu d'une erreur 500 de la base
[inside] - **Textes trop longs** : `SecurityHelper.tooLong(data, { name: 100, message: 5000 })` donne une erreur 400 claire au lieu d'une erreur 500 de la base
- **Mot de passe oublié** : envoie toujours un lien valable une heure, jamais un nouveau mot de passe (sinon n'importe qui connaissant l'e-mail bloque le compte)

### Base de données

[mysql] - **MySQL** tourne dans Docker, base `{{DB_NAME}}`, utilisateur `root`, mot de passe dans `{{BACK_ROOT}}/{{BACK_ENV_DEV}}`
[mysql] - **phpMyAdmin** : http://localhost:{{PMA_PORT}} pour voir et modifier les tables
[mysql] - **Créer les tables au premier démarrage** : mets un fichier `.sql` dans `mysql/init/` ; il est exécuté une seule fois, quand le dossier `database/` est vide
[sqlite] - **SQLite** : un simple fichier, `{{BACK_ROOT}}/database/database.sqlite`, créé tout seul à la première requête
[sqlite] - **Passer à MySQL plus tard** : `DB_CONNECTION=mysql` et les valeurs `DB_*` dans `{{BACK_ROOT}}/.env`, le code ne change pas
[mysqli] - **Connexion** : `getDbConnection()` dans `backend/config/database.php` (mysqli)
[pdo] - **Connexion** : `getDbConnection()` dans `backend/config/database.php` (PDO)
- **Dans un contrôleur** : `{{BACK_DB}}`, et aussi `fetchOne`, `insert` (renvoie le nouvel id), `execute` (renvoie le nombre de lignes modifiées). Les `?` protègent des injections SQL
[laravel] - **Eloquent et les migrations** restent disponibles : `docker compose exec backend php artisan make:model Product -m`
[symfony] - **Doctrine** est installé (`symfony/orm-pack`) si tu préfères les entités

[front] ### Adresse du front autorisée (CORS)
[front]
[front] Seul le front peut appeler l'API (avec les cookies de session) : `APP_BASE_URL` dans `{{BACK_ROOT}}/{{BACK_ENV_DEV}}`
[front] (http://localhost:{{APP_PORT}} en développement) et dans `{{BACK_ROOT}}/{{BACK_ENV_PROD}}` (l'adresse réelle du site).
[front] Côté front, l'API s'appelle avec `api.get('/products')` (client `api.js`).
[inside] ### Le site et l'API ensemble
[inside]
[inside] Le site et l'API tournent dans le même serveur, à la même adresse : rien à régler pour qu'ils se parlent (pas de CORS).
[inside] Côté front, `api.get('/products')` (client `api.js`) appelle `/api/products`, dans le navigateur comme au premier affichage d'une page.

### Lancer et mettre en ligne

[docker] - **Développement** : `start.bat` puis `D`. L'API tourne dans Docker (PHP + Apache) sur http://localhost:{{API_PORT}}
[docker] - **Commandes dans le conteneur** : `docker compose exec backend ...` (Composer, scripts)
[inside] - **Développement** : `start.bat` puis `D` (ou `npm run dev` dans `frontend/`) : le site sur http://localhost:{{APP_PORT}}, l'API sur http://localhost:{{APP_PORT}}/api, tout redémarre à chaque modification
[node] - **Développement** : `start.bat` puis `D` (ou `npm run dev` dans `backend/`), sur http://localhost:{{API_PORT}}, redémarre à chaque modification
[slim] - **En ligne** : envoie `backend/` (avec `vendor/` et `.env.production`, sans le `.env`) sur un hébergement PHP, le site pointe sur `backend/public/`. Sans `.env`, l'API lit `.env.production` (`config/env.php`) : rien à régler sur le serveur
[php] - **En ligne** : envoie `backend/` (avec `.env.production`, sans le `.env`) sur un hébergement PHP, le site pointe sur `backend/public/` (aucun Composer nécessaire). Sans `.env`, l'API lit `.env.production` (`config/env.php`) : rien à régler sur le serveur
[laravel] - **En ligne** : envoie `backend/` (avec `vendor/`), le site pointe sur `backend/public/`
[symfony] - **En ligne** : envoie `backend/` (avec `vendor/`), le site pointe sur `backend/public/`, `APP_ENV=prod` dans `backend/.env.prod.local`
[nitro] - **En ligne** : `start.bat` puis `A` (compilation dans `backend/.output`), puis `npm start` sur le serveur (Node.js 22.13+)
[inside] - **En ligne** : le site et l'API forment un seul serveur Node.js (22.13+) : un seul envoi, une seule adresse, les étapes sont dans « Mettre en ligne » ci-dessous. Un site avec API ne peut pas être purement statique
[express] - **En ligne** : envoie `backend/`, puis `npm install --omit=dev` et `npm start` sur le serveur (Node.js 22.13+)
[nest] - **En ligne** : `start.bat` puis `A` (compilation dans `backend/dist`), envoie `backend/`, puis `npm install --omit=dev` et `npm start` sur le serveur (Node.js 22.13+)
[adonis] - **En ligne** : `start.bat` puis `A` (compilation dans `backend/build`), envoie `backend/build/` avec `.env.production` renommé en `.env`, puis `npm ci --omit=dev` et `node bin/server.js` sur le serveur (Node.js 24+)
