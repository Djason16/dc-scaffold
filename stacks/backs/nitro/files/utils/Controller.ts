import type { H3Event } from 'h3'

/**
 * Base class for every controller in controllers/: short helpers so each controller stays small.
 *
 *   export default class ProductsController extends Controller {
 *       async getAll(event) {
 *           return ResponseHelper.success(event, { products: await this.fetchAll('SELECT * FROM products') })
 *       }
 *   }
 */
export class Controller {
    // Optional: change the URL prefix (default ProductsController -> /products)
    static prefix?: string

    // Optional: routes the REST naming cannot guess, e.g. { markShipped: ['POST', '/{id}/mark-shipped'] }
    static routes: Record<string, [string, string]> = {}

    body = (event: H3Event) => RequestHelper.body(event)
    fetchAll = DatabaseHelper.fetchAll
    fetchOne = DatabaseHelper.fetchOne
    insert = DatabaseHelper.insert
    execute = DatabaseHelper.execute

    // Answer of an update or a delete by id: { id } when a row changed, else 404
    changed = (event: H3Event, changed: number | boolean, id: number | string, notFound?: string) =>
        changed ? ResponseHelper.success(event, { id }) : ResponseHelper.notFound(event, notFound)
}
