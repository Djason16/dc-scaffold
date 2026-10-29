
## API (back end)

The API is in `{{BACK_DIR}}/`. It always answers in JSON: `{ "success": true, ... }` on success,
`{ "success": false, "error": "...", "type": "NOT_FOUND" }` on error (unknown address, wrong method and crashes included).

### Where things are

- **Controllers** (your routes): `{{BACK_CONTROLLERS_PATH}}/`
- **Helpers** (responses, reading requests, database): `{{BACK_HELPERS_PATH}}/`
- **Middlewares** (CORS, sessions, errors): `{{BACK_MIDDLEWARE_PATH}}`
- **Start-up** (middlewares, automatic routes): `{{BACK_ENTRY_PATH}}`
- **Settings**: `{{BACK_ROOT}}/{{BACK_ENV_DEV}}` (development) and `{{BACK_ROOT}}/{{BACK_ENV_PROD}}` (online)

### New route

Create a controller, for example `{{BACK_CONTROLLERS_PATH}}/{{BACK_CONTROLLER_FILE}}` (full example just below).
Its methods become routes by themselves:

| Method | Route |
| ------ | ----- |
| `getAll` | `GET /products` |
| `getOne` | `GET /products/{id}` |
| `create` | `POST /products` |
| `update` | `PUT /products/{id}` |
| `delete` | `DELETE /products/{id}` |

- The prefix comes from the file name: `ProductsController` → `/products`, `BlogPostsController` → `/blog-posts`
- Any other route: `{{BACK_CUSTOM_ROUTE}}`
- A method without a route stays private: the front cannot call it
[inside] - The API is on the same address as the site, under `/api`: `GET /products` answers on http://localhost:{{APP_PORT}}/api/products

### Structure and example

{{BACK_DOC}}

### Reading the request and answering

- What the front sends: `{{BACK_BODY}}`
- Required fields: `{{BACK_MISSING}}` gives the list of the missing ones
- Answer: `{{BACK_SUCCESS}}`
- Errors: `notFound`, `validationError`, `authError`, `forbidden`, `serverError` of `ResponseHelper`, all in the same format

### Database

[mysql] - **MySQL** runs in Docker, database `{{DB_NAME}}`, user `root`, password in `{{BACK_ROOT}}/{{BACK_ENV_DEV}}`
[mysql] - **phpMyAdmin**: http://localhost:{{PMA_PORT}} to see and edit the tables
[mysql] - **Create the tables on first start**: put a `.sql` file in `mysql/init/`; it runs once, when the `database/` folder is empty
[sqlite] - **SQLite**: a plain file, `{{BACK_ROOT}}/database/database.sqlite`, created by itself on the first request
[sqlite] - **Move to MySQL later**: `DB_CONNECTION=mysql` and the `DB_*` values in `{{BACK_ROOT}}/.env`, the code does not change
[mysqli] - **Connection**: `getDbConnection()` in `backend/config/database.php` (mysqli)
[pdo] - **Connection**: `getDbConnection()` in `backend/config/database.php` (PDO)
- **In a controller**: `{{BACK_DB}}`, and also `fetchOne`, `insert` (returns the new id), `execute` (returns the number of changed rows). The `?` protect from SQL injection
[laravel] - **Eloquent and migrations** are still available: `docker compose exec backend php artisan make:model Product -m`
[symfony] - **Doctrine** is installed (`symfony/orm-pack`) if you prefer entities

[front] ### Front address allowed (CORS)
[front]
[front] Only the front can call the API (with the session cookies): `APP_BASE_URL` in `{{BACK_ROOT}}/{{BACK_ENV_DEV}}`
[front] (http://localhost:{{APP_PORT}} in development) and in `{{BACK_ROOT}}/{{BACK_ENV_PROD}}` (the real address of the site).
[front] In the front, the API is called with `api.get('/products')` (`api.js` client).
[inside] ### The site and the API together
[inside]
[inside] The site and the API run in the same server, on the same address: nothing to set for them to talk (no CORS).
[inside] In the front, `api.get('/products')` (`api.js` client) calls `/api/products`, in the browser as on the first display of a page.

### Running it and going online

[docker] - **Development**: `start.bat` then `D`. The API runs in Docker (PHP + Apache) on http://localhost:{{API_PORT}}
[docker] - **Commands in the container**: `docker compose exec backend ...` (Composer, scripts)
[inside] - **Development**: `start.bat` then `D` (or `npm run dev` in `frontend/`): the site on http://localhost:{{APP_PORT}}, the API on http://localhost:{{APP_PORT}}/api, everything restarts on every change
[node] - **Development**: `start.bat` then `D` (or `npm run dev` in `backend/`), on http://localhost:{{API_PORT}}, restarts on every change
[slim] - **Online**: upload `backend/` (with `vendor/`) to a PHP host, the site points to `backend/public/`
[php] - **Online**: upload `backend/` to a PHP host, the site points to `backend/public/` (no Composer needed)
[laravel] - **Online**: upload `backend/` (with `vendor/`), the site points to `backend/public/`
[symfony] - **Online**: upload `backend/` (with `vendor/`), the site points to `backend/public/`, `APP_ENV=prod` in `backend/.env.prod.local`
[nitro] - **Online**: `start.bat` then `A` (build in `backend/.output`), then `npm start` on the server (Node.js 22.13+)
[inside] - **Online**: the site and the API are one Node.js (22.13+) server: one upload, one address, the steps are in "Going online" below. A site with an API cannot be purely static
[express] - **Online**: upload `backend/`, then `npm install --omit=dev` and `npm start` on the server (Node.js 22.13+)
[nest] - **Online**: `start.bat` then `A` (build in `backend/dist`), upload `backend/`, then `npm install --omit=dev` and `npm start` on the server (Node.js 22.13+)
[adonis] - **Online**: `start.bat` then `A` (build in `backend/build`), upload `backend/build/` with `.env.production` renamed `.env`, then `npm ci --omit=dev` and `node bin/server.js` on the server (Node.js 24+)
