<!-- Section of the project README when Nitro is inside Nuxt: [fr] / [en] lines are kept for that language only -->
```
frontend/
[fr] ├── server/
[fr] │   ├── controllers/          tes contrôleurs (routes créées automatiquement, sous /api)
[fr] │   ├── api/                  index.get.ts (GET /api) + [...path].ts (routeur des contrôleurs, erreurs en JSON)
[fr] │   ├── utils/                Controller, ResponseHelper, RequestHelper, DatabaseHelper, RouteDiscovery (importés automatiquement)
[fr] │   └── middleware/           code lancé avant chaque requête (vide au départ)
[fr] ├── modules/controllers.ts    trouve tout seul les fichiers de server/controllers
[fr] └── pages/, components/...   le site
[en] ├── server/
[en] │   ├── controllers/          your controllers (routes built automatically, under /api)
[en] │   ├── api/                  index.get.ts (GET /api) + [...path].ts (controller router, JSON errors)
[en] │   ├── utils/                Controller, ResponseHelper, RequestHelper, DatabaseHelper, RouteDiscovery (auto-imported)
[en] │   └── middleware/           code run before every request (empty at first)
[en] ├── modules/controllers.ts    finds the files of server/controllers by itself
[en] └── pages/, components/...   the site
```

`frontend/server/controllers/ProductsController.ts`

```ts
export default class ProductsController extends Controller {
    // Routes the REST naming cannot guess
    static routes = { markShipped: ['POST', '/{id}/mark-shipped'] as [string, string] }

    async getAll(event) {
        return ResponseHelper.success(event, { products: await this.fetchAll('SELECT * FROM products') })
    }

    async getOne(event, args) {
        const product = await this.fetchOne('SELECT * FROM products WHERE id = ?', [Number(args.id)])
        return product ? ResponseHelper.success(event, { product }) : ResponseHelper.notFound(event, 'Product not found')
    }

    async create(event) {
        const data = await this.body(event)
        const missing = RequestHelper.missing(data, ['name', 'price'])
        if (missing.length) return ResponseHelper.validationError(event, `Missing fields: ${missing.join(', ')}`)

        const id = await this.insert('INSERT INTO products (name, price) VALUES (?, ?)', [data.name, Number(data.price)])
        return ResponseHelper.success(event, { id }, 201)
    }

    async markShipped(event, args) {
        await this.execute('UPDATE products SET shipped = 1 WHERE id = ?', [Number(args.id)])
        return ResponseHelper.success(event)
    }
}
```
