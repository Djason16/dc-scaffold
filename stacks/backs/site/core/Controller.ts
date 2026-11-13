import { DatabaseHelper } from './DatabaseHelper'
import { RequestHelper } from './RequestHelper'
import { ResponseHelper } from './ResponseHelper'

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
    static prefix?: string

    // Optional: routes the REST naming cannot guess, e.g. { markShipped: ['POST', '/{id}/mark-shipped'] }
    static routes: Record<string, [string, string]> = {}

    body = (request: Request) => RequestHelper.body(request)
    fetchAll = DatabaseHelper.fetchAll
    fetchOne = DatabaseHelper.fetchOne
    insert = DatabaseHelper.insert
    execute = DatabaseHelper.execute

    // Answer of an update or a delete by id: { id } when a row changed, else 404
    changed = (changed: number | boolean, id: number | string, notFound?: string) => (changed ? ResponseHelper.success({ id }) : ResponseHelper.notFound(notFound))
}
