<!-- Section of the project README: [fr] / [en] lines are kept for that language only -->
[fr] Structure officielle d'AdonisJS (kit API : comptes, validation, Lucid), avec les mêmes helpers et conventions que les autres back ends :
[en] Official AdonisJS structure (API kit: accounts, validation, Lucid), with the same helpers and conventions as the other back ends:

[fr] - `app/controllers/` — tes contrôleurs, un fichier `products_controller.ts` par ressource (`node ace make:controller products`)
[en] - `app/controllers/` — your controllers, one `products_controller.ts` file per resource (`node ace make:controller products`)
[fr] - `app/core/` — `Controller` (base : `fetchAll`, `fetchOne`, `insert`, `execute`, `body`, par Lucid) + `RouteDiscovery`
[en] - `app/core/` — `Controller` (base: `fetchAll`, `fetchOne`, `insert`, `execute`, `body`, through Lucid) + `RouteDiscovery`
[fr] - `app/helpers/` — `ResponseHelper`, `RequestHelper`
[en] - `app/helpers/` — `ResponseHelper`, `RequestHelper`
[fr] - `start/routes.ts` — route de base, comptes (`/auth/signup`, `/auth/login`, `/account/profile`), routes automatiques
[en] - `start/routes.ts` — base route, accounts (`/auth/signup`, `/auth/login`, `/account/profile`), automatic routes
[fr] - `app/exceptions/handler.ts` — toutes les erreurs au format JSON commun ; `config/cors.ts` — seulement `APP_BASE_URL`, avec les cookies
[en] - `app/exceptions/handler.ts` — every error in the shared JSON format; `config/cors.ts` — only `APP_BASE_URL`, with cookies

`backend/app/controllers/products_controller.ts`

```ts
import type { HttpContext } from '@adonisjs/core/http'
import { Controller } from '#core/controller'
import { RequestHelper } from '#helpers/request_helper'
import { ResponseHelper } from '#helpers/response_helper'

export default class ProductsController extends Controller {
    // Routes the REST naming cannot guess
    static routes: Record<string, [string, string]> = { markShipped: ['POST', '/{id}/mark-shipped'] }

    async getAll({ response }: HttpContext) {
        return ResponseHelper.success(response, { products: await this.fetchAll('SELECT * FROM products') })
    }

    async getOne({ params, response }: HttpContext) {
        const product = await this.fetchOne('SELECT * FROM products WHERE id = ?', [Number(params.id)])
        return product ? ResponseHelper.success(response, { product }) : ResponseHelper.notFound(response, 'Product not found')
    }

    async create({ request, response }: HttpContext) {
        const data = this.body(request)
        const missing = RequestHelper.missing(data, ['name', 'price'])
        if (missing.length) return ResponseHelper.validationError(response, `Missing fields: ${missing.join(', ')}`)

        const id = await this.insert('INSERT INTO products (name, price) VALUES (?, ?)', [data.name, Number(data.price)])
        return ResponseHelper.success(response, { id }, 201)
    }

    async markShipped({ params, response }: HttpContext) {
        await this.execute('UPDATE products SET shipped = 1 WHERE id = ?', [Number(params.id)])
        return ResponseHelper.success(response)
    }
}
```

[fr] - **Comptes utilisateurs** : crée leurs tables une fois avec `node ace migration:run` (dans `backend/`)
[en] - **User accounts**: create their tables once with `node ace migration:run` (in `backend/`)
[fr] - **Validation** (VineJS) et **modèles** (Lucid) restent disponibles : `node ace make:validator`, `node ace make:model Product -m`
[en] - **Validation** (VineJS) and **models** (Lucid) are still there: `node ace make:validator`, `node ace make:model Product -m`
