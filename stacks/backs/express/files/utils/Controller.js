import { DatabaseHelper } from './DatabaseHelper.js'
import { RequestHelper } from './RequestHelper.js'

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
    fetchAll = DatabaseHelper.fetchAll
    fetchOne = DatabaseHelper.fetchOne
    insert = DatabaseHelper.insert
    execute = DatabaseHelper.execute
}
