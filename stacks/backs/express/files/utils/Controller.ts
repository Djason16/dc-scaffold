import type { Request, Response } from 'express'
import { DatabaseHelper } from './DatabaseHelper.ts'
import { RequestHelper } from './RequestHelper.ts'
import { ResponseHelper } from './ResponseHelper.ts'

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
    static prefix?: string

    // Optional: routes the REST naming cannot guess, e.g. { markShipped: ['POST', '/{id}/mark-shipped'] }
    static routes: Record<string, [string, string]> = {}

    body = (req: Request) => RequestHelper.body(req)
    fetchAll = (sql: string, params?: unknown[]) => DatabaseHelper.fetchAll(sql, params)
    fetchOne = (sql: string, params?: unknown[]) => DatabaseHelper.fetchOne(sql, params)
    insert = (sql: string, params?: unknown[]) => DatabaseHelper.insert(sql, params)
    execute = (sql: string, params?: unknown[]) => DatabaseHelper.execute(sql, params)

    // Answer of an update or a delete by id: { id } when a row changed, else 404
    changed = (res: Response, changed: number | boolean, id: number | string, notFound?: string) => (changed ? ResponseHelper.success(res, { id }) : ResponseHelper.notFound(res, notFound))
}
