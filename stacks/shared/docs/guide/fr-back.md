
## API (back end)

L'API est dans `backend/`. Elle répond toujours en JSON : `{ "success": true, ... }` en cas de succès,
`{ "success": false, "error": "...", "type": "NOT_FOUND" }` en cas d'erreur (adresse inconnue, mauvaise méthode, plantage compris).

### Où sont les choses

- **Contrôleurs** (tes routes) : `backend/{{BACK_CONTROLLERS}}/`
- **Helpers** (réponses, lecture des requêtes, base de données) : `backend/{{BACK_HELPERS}}/`
- **Middlewares** (CORS, sessions, erreurs) : `backend/{{BACK_MIDDLEWARE}}`
- **Démarrage** (middlewares, routes automatiques) : `backend/{{BACK_ENTRY}}`
- **Réglages** : `backend/{{BACK_ENV_DEV}}` (développement) et `backend/{{BACK_ENV_PROD}}` (en ligne)

### Nouvelle route

Crée un contrôleur, par exemple `backend/{{BACK_CONTROLLERS}}/ProductsController.{{BACK_EXT}}` (exemple complet juste en dessous).
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

### Structure et exemple

{{BACK_DOC}}

### Lire la requête et répondre

- Ce que le front envoie : `{{BACK_BODY}}`
- Champs obligatoires : `{{BACK_MISSING}}` donne la liste de ceux qui manquent
- Répondre : `{{BACK_SUCCESS}}`
- Erreurs : `notFound`, `validationError`, `authError`, `forbidden`, `serverError` de `ResponseHelper`, toutes au même format

### Base de données

[mysql] - **MySQL** tourne dans Docker, base `{{DB_NAME}}`, utilisateur `root`, mot de passe dans `backend/{{BACK_ENV_DEV}}`
[mysql] - **phpMyAdmin** : http://localhost:{{PMA_PORT}} pour voir et modifier les tables
[mysql] - **Créer les tables au premier démarrage** : mets un fichier `.sql` dans `mysql/init/` ; il est exécuté une seule fois, quand le dossier `database/` est vide
[sqlite] - **SQLite** : un simple fichier, `backend/database/database.sqlite`, créé tout seul à la première requête
[sqlite] - **Passer à MySQL plus tard** : `DB_CONNECTION=mysql` et les valeurs `DB_*` dans `backend/.env`, le code ne change pas
[mysqli] - **Connexion** : `getDbConnection()` dans `backend/config/database.php` (mysqli)
[pdo] - **Connexion** : `getDbConnection()` dans `backend/config/database.php` (PDO)
- **Dans un contrôleur** : `{{BACK_DB}}`, et aussi `fetchOne`, `insert` (renvoie le nouvel id), `execute` (renvoie le nombre de lignes modifiées). Les `?` protègent des injections SQL
[laravel] - **Eloquent et les migrations** restent disponibles : `docker compose exec backend php artisan make:model Product -m`
[symfony] - **Doctrine** est installé (`symfony/orm-pack`) si tu préfères les entités

[front] ### Adresse du front autorisée (CORS)
[front]
[front] Seul le front peut appeler l'API (avec les cookies de session) : `APP_BASE_URL` dans `backend/{{BACK_ENV_DEV}}`
[front] (http://localhost:{{APP_PORT}} en développement) et dans `backend/{{BACK_ENV_PROD}}` (l'adresse réelle du site).
[front] Côté front, l'API s'appelle avec `api.get('/products')` (client `api.js`).

### Lancer et mettre en ligne

[docker] - **Développement** : `start.bat` puis `D`. L'API tourne dans Docker (PHP + Apache) sur http://localhost:{{API_PORT}}
[docker] - **Commandes dans le conteneur** : `docker compose exec backend ...` (Composer, scripts)
[node] - **Développement** : `start.bat` puis `D` (ou `npm run dev` dans `backend/`), sur http://localhost:{{API_PORT}}, redémarre à chaque modification
[slim] - **En ligne** : envoie `backend/` (avec `vendor/`) sur un hébergement PHP, le site pointe sur `backend/public/`
[php] - **En ligne** : envoie `backend/` sur un hébergement PHP, le site pointe sur `backend/public/` (aucun Composer nécessaire)
[laravel] - **En ligne** : envoie `backend/` (avec `vendor/`), le site pointe sur `backend/public/`
[symfony] - **En ligne** : envoie `backend/` (avec `vendor/`), le site pointe sur `backend/public/`, `APP_ENV=prod` dans `backend/.env.prod.local`
[nitro] - **En ligne** : `start.bat` puis `A` (compilation dans `backend/.output`), puis `npm start` sur le serveur (Node.js 22.13+)
[express] - **En ligne** : envoie `backend/`, puis `npm install --omit=dev` et `npm start` sur le serveur (Node.js 22.13+)
