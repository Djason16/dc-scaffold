import { DatabaseHelper } from './DatabaseHelper.js'
import { RequestHelper } from './RequestHelper.js'

/**
 * Base class for every controller in controllers/: short helpers so each controller stays small.
 *
 *   export default class ProductsController extends Controller {
 *       async getAll(request) {
 *           return ResponseHelper.success({ products: await this.fetchAll('SELECT * FROM products') })
 *       }
 *   }
 */
export class Controller {
    // Optional: change the URL prefix (default ProductsController -> /products)
    /** @type {string | undefined} */
    static prefix

    // Optional: routes the REST naming cannot guess, e.g. { markShipped: ['POST', '/{id}/mark-shipped'] }
    /** @type {Record<string, string[]>} */
    static routes = {}

    /** @param {Request} request */
    body = (request) => RequestHelper.body(request)
    fetchAll = DatabaseHelper.fetchAll
    fetchOne = DatabaseHelper.fetchOne
    insert = DatabaseHelper.insert
    execute = DatabaseHelper.execute
}
