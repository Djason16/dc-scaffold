<!-- Section of the project README: [fr] / [en] lines are kept for that language only -->
```
backend/
[fr] ├── server.js                 middlewares + routes automatiques
[en] ├── server.js                 middlewares + automatic routes
[fr] ├── controllers/              tes contrôleurs (routes créées automatiquement)
[en] ├── controllers/              your controllers (routes built automatically)
├── utils/                    Controller, ResponseHelper, RequestHelper, DatabaseHelper, RouteDiscovery
[fr] └── middleware/               cors.js, errors.js (toutes les erreurs au format JSON commun)
[en] └── middleware/               cors.js, errors.js (every error in the shared JSON format)
```

`backend/controllers/ProductsController.js`

```js
import { Controller } from '../utils/Controller.js'
import { RequestHelper } from '../utils/RequestHelper.js'
import { ResponseHelper } from '../utils/ResponseHelper.js'

export default class ProductsController extends Controller {
    // Routes the REST naming cannot guess
    static routes = { markShipped: ['POST', '/{id}/mark-shipped'] }

    async getAll(req, res) {
        return ResponseHelper.success(res, { products: await this.fetchAll('SELECT * FROM products') })
    }

    async getOne(req, res, args) {
        const product = await this.fetchOne('SELECT * FROM products WHERE id = ?', [Number(args.id)])
        return product ? ResponseHelper.success(res, { product }) : ResponseHelper.notFound(res, 'Product not found')
    }

    async create(req, res) {
        const data = this.body(req)
        const missing = RequestHelper.missing(data, ['name', 'price'])
        if (missing.length) return ResponseHelper.validationError(res, `Missing fields: ${missing.join(', ')}`)

        const id = await this.insert('INSERT INTO products (name, price) VALUES (?, ?)', [data.name, Number(data.price)])
        return ResponseHelper.success(res, { id }, 201)
    }

    async markShipped(req, res, args) {
        await this.execute('UPDATE products SET shipped = 1 WHERE id = ?', [Number(args.id)])
        return ResponseHelper.success(res)
    }
}
```
