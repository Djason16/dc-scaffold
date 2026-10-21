<!-- Section of the project README: [fr] / [en] lines are kept for that language only -->
[fr] Structure officielle de NestJS, avec les mêmes helpers et conventions que les autres back ends :
[en] Official NestJS structure, with the same helpers and conventions as the other back ends:

```
backend/src/
[fr] ├── main.ts                   démarrage : CORS (APP_BASE_URL, avec les cookies), erreurs au format JSON commun
[en] ├── main.ts                   startup: CORS (APP_BASE_URL, with cookies), errors in the shared JSON format
[fr] ├── app.module.ts             module racine (tes modules et contrôleurs Nest y vont aussi)
[en] ├── app.module.ts             root module (your own Nest modules and controllers go there too)
[fr] ├── routes.controller.ts      route de base + routes automatiques de controllers/
[en] ├── routes.controller.ts      base route + automatic routes of controllers/
[fr] ├── errors.filter.ts          toutes les erreurs au format JSON commun
[en] ├── errors.filter.ts          every error in the shared JSON format
[fr] ├── controllers/              tes contrôleurs (routes créées automatiquement)
[en] ├── controllers/              your controllers (routes built automatically)
└── utils/                    Controller, ResponseHelper, RequestHelper, DatabaseHelper, RouteDiscovery
```

`backend/src/controllers/ProductsController.ts`

```ts
import type { Request, Response } from 'express'
import { Controller } from '../utils/Controller.js'
import { RequestHelper } from '../utils/RequestHelper.js'
import { ResponseHelper } from '../utils/ResponseHelper.js'

export default class ProductsController extends Controller {
    // Routes the REST naming cannot guess
    static routes = { markShipped: ['POST', '/{id}/mark-shipped'] }

    async getAll(req: Request, res: Response) {
        return ResponseHelper.success(res, { products: await this.fetchAll('SELECT * FROM products') })
    }

    async getOne(req: Request, res: Response, args: Record<string, string>) {
        const product = await this.fetchOne('SELECT * FROM products WHERE id = ?', [Number(args.id)])
        return product ? ResponseHelper.success(res, { product }) : ResponseHelper.notFound(res, 'Product not found')
    }

    async create(req: Request, res: Response) {
        const data = this.body(req)
        const missing = RequestHelper.missing(data, ['name', 'price'])
        if (missing.length) return ResponseHelper.validationError(res, `Missing fields: ${missing.join(', ')}`)

        const id = await this.insert('INSERT INTO products (name, price) VALUES (?, ?)', [data.name, Number(data.price)])
        return ResponseHelper.success(res, { id }, 201)
    }

    async markShipped(req: Request, res: Response, args: Record<string, string>) {
        await this.execute('UPDATE products SET shipped = 1 WHERE id = ?', [Number(args.id)])
        return ResponseHelper.success(res)
    }
}
```

[fr] Les contrôleurs Nest classiques (`@Controller('...')`, `@Get()`, injection de services) marchent aussi : ajoute-les dans `app.module.ts`, avant `RoutesController`.
[en] Classic Nest controllers (`@Controller('...')`, `@Get()`, service injection) work too: add them to `app.module.ts`, before `RoutesController`.
