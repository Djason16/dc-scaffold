# 6. L'API (back end)

[← Sommaire](README.md)

Tous les back ends fonctionnent de la même façon, quel que soit le langage : mêmes noms de helpers, mêmes routes
automatiques, même format JSON. Ce qui change d'un back end à l'autre est résumé à la fin.

## Le format des réponses

Toujours du JSON :

```json
{ "success": true, "products": [ ... ] }
{ "success": false, "error": "Product not found", "type": "NOT_FOUND" }
```

| `type` | Quand |
| ------ | ----- |
| `VALIDATION_ERROR` | `ResponseHelper.validationError(...)`, code 400 |
| `AUTH_ERROR` | `authError`, 401 |
| `FORBIDDEN` | `forbidden`, 403 |
| `NOT_FOUND` | `notFound`, ou adresse inconnue, 404 |
| `METHOD_NOT_ALLOWED` | l'adresse existe mais pas avec cette méthode (par exemple `DELETE` sans `delete()`), 405 |
| `SERVER_ERROR` | `serverError`, ou une erreur dans ton code, 500 |

Une erreur dans ton code ne casse pas le serveur : elle devient une réponse 500. **En développement**, le vrai message
est affiché (pour corriger) ; **en ligne** (`APP_ENV=production`), seulement `Internal server error`.

`GET /` (ou `GET /api` avec l'API dans le site) répond `API ready`, avec le nom, l'environnement, le fuseau et l'heure :
pratique pour vérifier que l'API tourne.

## Les routes automatiques

Crée un contrôleur dans le dossier des contrôleurs. Ses méthodes deviennent des routes **toutes seules** :

| Méthode | Route |
| ------- | ----- |
| `getAll` | `GET /products` |
| `getOne` | `GET /products/{id}` |
| `create` | `POST /products` |
| `update` | `PUT /products/{id}` et `PATCH /products/{id}` |
| `delete` | `DELETE /products/{id}` |

- Le **préfixe** vient du nom du fichier : `ProductsController` → `/products`, `BlogPostsController` → `/blog-posts`.
  Pour un autre préfixe : `static prefix = '/catalogue'` (JavaScript).
- **Une autre route** se déclare sur la méthode :
  - PHP : `#[Route('POST', '/{id}/mark-shipped')]` au-dessus de la méthode ;
  - JavaScript : `static routes = { markShipped: ['POST', '/{id}/mark-shipped'] }`.
- Les routes fixes passent avant les routes à paramètre : `/products/export` n'est pas pris par `/products/{id}`.
- Une méthode **sans route reste privée** : le front ne peut pas l'appeler.
- Avec l'API dans le site, toutes les routes sont sous `/api` : `GET /api/products`.

En développement, un nouveau contrôleur est pris en compte tout seul (pour les back ends Node.js et l'API dans le site,
en quelques secondes, sans relancer).

## Exemple complet (JavaScript, API dans le site)

```js
import { Controller, RequestHelper, ResponseHelper } from '../index.js'

export default class ProductsController extends Controller {
    static routes = { markShipped: ['POST', '/{id}/mark-shipped'] }

    async getAll() {
        return ResponseHelper.success({ products: await this.fetchAll('SELECT * FROM products') })
    }

    async getOne(request, args) {
        const product = await this.fetchOne('SELECT * FROM products WHERE id = ?', [Number(args.id)])
        return product ? ResponseHelper.success({ product }) : ResponseHelper.notFound('Product not found')
    }

    async create(request) {
        const data = await this.body(request)
        const missing = RequestHelper.missing(data, ['name', 'price'])
        if (missing.length) return ResponseHelper.validationError(`Missing fields: ${missing.join(', ')}`)

        const id = await this.insert('INSERT INTO products (name, price) VALUES (?, ?)', [data.name, Number(data.price)])
        return ResponseHelper.success({ id }, 201)
    }

    async markShipped(request, args) {
        await this.execute('UPDATE products SET shipped = 1 WHERE id = ?', [Number(args.id)])
        return ResponseHelper.success()
    }
}
```

L'exemple de **ton** back end (PHP, Nitro, Express...) est dans le `README.md` du projet, section « Structure et exemple ».

## Les helpers

| Helper | Méthodes |
| ------ | -------- |
| **ResponseHelper** | `success(données, code)`, `error(message, code, type)`, `validationError`, `authError`, `forbidden`, `notFound`, `serverError` |
| **RequestHelper** | `body` (corps JSON ou formulaire, en objet), `query(clé)` (paramètre `?page=2`), `missing(données, champs)` (liste des champs obligatoires vides) |
| **DatabaseHelper** (dans chaque contrôleur : `this.`) | `fetchAll(sql, params)` (toutes les lignes), `fetchOne` (la première ou `null`), `insert` (renvoie le nouvel id), `execute` (renvoie le nombre de lignes modifiées) |

Les `?` des requêtes SQL protègent des injections : ne mets jamais une valeur du visiteur directement dans le texte SQL.

## Chaque back end

| Back end | Contrôleurs | Helpers | Démarrage | Répondre | Lire le corps |
| -------- | ----------- | ------- | --------- | -------- | ------------- |
| Slim 4 | `backend/src/Controllers/` | `src/Helper/` | `public/index.php` | `ResponseHelper::success($response, ['products' => $products])` | `$this->body($request)` |
| Laravel | `backend/app/Http/Controllers/` | `app/Helper/` | `routes/api.php` | `ResponseHelper::success(['products' => $products])` | `$this->body($request)` |
| Symfony | `backend/src/Controller/` | `src/Helper/` | `config/routes/auto_routes.php` | `ResponseHelper::success(['products' => $products])` | `$this->body($request)` |
| PHP | `backend/src/Controllers/` | `src/Helper/` | `public/index.php` | `ResponseHelper::success(['products' => $products])` | `$this->body()` |
| Nitro | `backend/controllers/` | `utils/` (importés automatiquement) | `routes/[...path].ts` | `ResponseHelper.success(event, { products })` | `await this.body(event)` |
| Nitro dans Nuxt | `frontend/server/controllers/` | `server/utils/` | `server/api/[...path].ts` | `ResponseHelper.success(event, { products })` | `await this.body(event)` |
| Express | `backend/controllers/` | `utils/` | `server.js` | `ResponseHelper.success(res, { products })` | `this.body(req)` |
| NestJS | `backend/src/controllers/` | `src/utils/` | `src/routes.controller.ts` | `ResponseHelper.success(res, { products })` | `this.body(req)` |
| AdonisJS | `backend/app/controllers/` | `app/helpers/` | `start/routes.ts` | `ResponseHelper.success(response, { products })` | `this.body(request)` |
| API dans le site | `frontend/<api>/controllers/` | `index.js` (un seul import) | la route `/api` du framework | `ResponseHelper.success({ products })` | `await this.body(request)` |

Pour « API dans le site », `<api>` est `server` (Next.js), `src/lib/server` (SvelteKit), `src/server` (Astro, Qwik).

Ce qui reste disponible en plus : **Eloquent et les migrations** dans Laravel
(`docker compose exec backend php artisan make:model Product -m`), **Doctrine** dans Symfony, **Lucid** et **VineJS** dans
AdonisJS, les contrôleurs classiques de NestJS à côté des contrôleurs automatiques.

## Le CORS (API séparée)

Le navigateur n'autorise un site à appeler une API sur une autre adresse que si l'API le permet. Chaque back end
n'autorise **que l'adresse du site**, avec les cookies de session : `APP_BASE_URL` dans le `.env` de l'API
(http://localhost:3000 en développement) et dans `.env.production` (l'adresse réelle du site).

Avec l'API dans le site, le site et l'API ont la même adresse : **pas de CORS**.

## Lancer l'API

| Back end | Développement |
| -------- | ------------- |
| PHP (Slim, Laravel, Symfony, PHP) | `start.bat` puis `D` : PHP + Apache dans Docker, sur http://localhost:8000. Commandes dans le conteneur : `docker compose exec backend ...` |
| Node.js (Nitro, Express, NestJS, AdonisJS) | `start.bat` puis `D` (ou `npm run dev` dans `backend/`) : redémarre à chaque modification |
| API dans le site | `start.bat` puis `D` (ou `npm run dev` dans `frontend/`) : le site et l'API ensemble |

Mise en ligne : [8. Mettre en ligne](08-mise-en-ligne.md).
