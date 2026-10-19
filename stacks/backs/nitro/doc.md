<!-- Section of the project README: [fr] / [en] lines are kept for that language only -->
```
backend/
[fr] ├── controllers/              tes contrôleurs (routes créées automatiquement)
[en] ├── controllers/              your controllers (routes built automatically)
[fr] ├── routes/                   index.get.ts (route de base) + [...path].ts (routeur des contrôleurs)
[en] ├── routes/                   index.get.ts (base route) + [...path].ts (controller router)
[fr] ├── utils/                    Controller, ResponseHelper, RequestHelper, DatabaseHelper, RouteDiscovery (importés automatiquement)
[en] ├── utils/                    Controller, ResponseHelper, RequestHelper, DatabaseHelper, RouteDiscovery (auto-imported)
[fr] ├── middleware/cors.ts        seulement APP_BASE_URL, avec les cookies
[en] ├── middleware/cors.ts        only APP_BASE_URL, with cookies
[fr] └── error.ts                  toutes les erreurs au format JSON commun
[en] └── error.ts                  every error in the shared JSON format
```

`backend/controllers/ProductsController.ts`

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
