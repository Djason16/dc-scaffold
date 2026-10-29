<!-- Section of the project README when the API is inside the server of the site: [fr] / [en] lines are kept for that language only -->
```
frontend/
[fr] ├── src/lib/server/
[fr] │   ├── controllers/          tes contrôleurs (routes créées automatiquement, sous /api)
[fr] │   ├── index.js              Controller, ResponseHelper, RequestHelper, DatabaseHelper (un seul import)
[fr] │   ├── handler.js            routeur de l'API : GET /api, routes des contrôleurs, erreurs en JSON
[fr] │   └── controllers.js        trouve tout seul les fichiers de controllers/
[fr] ├── src/routes/api/[...path]/+server.js      reçoit chaque adresse /api
[fr] └── src/routes/, src/lib/...                 le site
[en] ├── src/lib/server/
[en] │   ├── controllers/          your controllers (routes built automatically, under /api)
[en] │   ├── index.js              Controller, ResponseHelper, RequestHelper, DatabaseHelper (one import)
[en] │   ├── handler.js            router of the API: GET /api, routes of the controllers, JSON errors
[en] │   └── controllers.js        finds the files of controllers/ by itself
[en] ├── src/routes/api/[...path]/+server.js      receives every /api address
[en] └── src/routes/, src/lib/...                 the site
```

[fr] - Les pages du site restent pré-rendues ; l'API répond à chaque requête. Une page qui appelle l'API au build (pendant la compilation) n'a pas encore de serveur : appelle-la depuis le navigateur, ou rends la page à chaque visite
[en] - The pages of the site stay prerendered; the API answers on each request. A page that calls the API at build time has no server yet: call it from the browser, or render that page on each visit

`frontend/src/lib/server/controllers/ProductsController.js`

```js
import { Controller, RequestHelper, ResponseHelper } from '../index.js'

export default class ProductsController extends Controller {
    // Routes the REST naming cannot guess
    static routes = { markShipped: ['POST', '/{id}/mark-shipped'] }

    async getAll() {
        return ResponseHelper.success({ products: await this.fetchAll('SELECT * FROM products') })
    }

    /**
     * @param {Request} request
     * @param {Record<string, string>} args
     */
    async getOne(request, args) {
        const product = await this.fetchOne('SELECT * FROM products WHERE id = ?', [Number(args.id)])
        return product ? ResponseHelper.success({ product }) : ResponseHelper.notFound('Product not found')
    }

    /** @param {Request} request */
    async create(request) {
        const data = await this.body(request)
        const missing = RequestHelper.missing(data, ['name', 'price'])
        if (missing.length) return ResponseHelper.validationError(`Missing fields: ${missing.join(', ')}`)

        const id = await this.insert('INSERT INTO products (name, price) VALUES (?, ?)', [data.name, Number(data.price)])
        return ResponseHelper.success({ id }, 201)
    }

    /**
     * @param {Request} request
     * @param {Record<string, string>} args
     */
    async markShipped(request, args) {
        await this.execute('UPDATE products SET shipped = 1 WHERE id = ?', [Number(args.id)])
        return ResponseHelper.success()
    }
}
```
