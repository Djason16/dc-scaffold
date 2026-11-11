import { DatabaseHelper } from './DatabaseHelper.js'
import { RequestHelper } from './RequestHelper.js'
import { ResponseHelper } from './ResponseHelper.js'

/**
 * Base class for every controller in controllers/: short helpers so each controller stays small.
 *
 *   export default class ProductsController extends Controller {
 *       async getAll(req, res) {
 *           return ResponseHelper.success(res, { products: await this.fetchAll('SELECT * FROM products') })
 *       }
 *   }
 */
export class Controller {
    // Optional: change the URL prefix (default ProductsController -> /products)
    static prefix

    // Optional: routes the REST naming cannot guess, e.g. { markShipped: ['POST', '/{id}/mark-shipped'] }
    static routes = {}

    body = (req) => RequestHelper.body(req)
    fetchAll = (sql, params) => DatabaseHelper.fetchAll(sql, params)
    fetchOne = (sql, params) => DatabaseHelper.fetchOne(sql, params)
    insert = (sql, params) => DatabaseHelper.insert(sql, params)
    execute = (sql, params) => DatabaseHelper.execute(sql, params)

    // Answer of an update or a delete by id: { id } when a row changed, else 404
    changed = (res, changed, id, notFound) => (changed ? ResponseHelper.success(res, { id }) : ResponseHelper.notFound(res, notFound))
}
