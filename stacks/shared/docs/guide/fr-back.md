
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
[slim] - **En ligne** : envoie `backend/` (avec `vendor/`) sur un hébergement PHP, le site pointe sur `backend/public/`
[php] - **En ligne** : envoie `backend/` sur un hébergement PHP, le site pointe sur `backend/public/` (aucun Composer nécessaire)
[laravel] - **En ligne** : envoie `backend/` (avec `vendor/`), le site pointe sur `backend/public/`
[symfony] - **En ligne** : envoie `backend/` (avec `vendor/`), le site pointe sur `backend/public/`, `APP_ENV=prod` dans `backend/.env.prod.local`
[nitro] - **En ligne** : `start.bat` puis `A` (compilation dans `backend/.output`), puis `npm start` sur le serveur (Node.js 22.13+)
[inside] - **En ligne** : le site et l'API forment un seul serveur Node.js (22.13+) : un seul envoi, une seule adresse, les étapes sont dans « Mettre en ligne » ci-dessous. Un site avec API ne peut pas être purement statique
[express] - **En ligne** : envoie `backend/`, puis `npm install --omit=dev` et `npm start` sur le serveur (Node.js 22.13+)
[nest] - **En ligne** : `start.bat` puis `A` (compilation dans `backend/dist`), envoie `backend/`, puis `npm install --omit=dev` et `npm start` sur le serveur (Node.js 22.13+)
[adonis] - **En ligne** : `start.bat` puis `A` (compilation dans `backend/build`), envoie `backend/build/` avec `.env.production` renommé en `.env`, puis `npm ci --omit=dev` et `node bin/server.js` sur le serveur (Node.js 24+)
