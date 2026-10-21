import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { RequestHelper } from '#helpers/request_helper'

// MySQL gives [rows, fields] or [{ insertId, affectedRows }], SQLite gives rows or { lastInsertRowid, changes }
const rows = (result: any): Record<string, any>[] => (Array.isArray(result) ? (Array.isArray(result[0]) ? result[0] : result) : [])
const info = (result: any) => (Array.isArray(result) ? result[0] : result) ?? {}

/**
 * Base class for every controller in app/controllers: short helpers so each controller stays small
 * (same names as the other back ends). The queries go through Lucid, the database of AdonisJS (config/database.ts).
 *
 *   export default class ProductsController extends Controller {
 *       async getAll({ response }: HttpContext) {
 *           return ResponseHelper.success(response, { products: await this.fetchAll('SELECT * FROM products') })
 *       }
 *   }
 */
export class Controller {
    // Optional: change the URL prefix (default ProductsController -> /products)
    static prefix?: string

    // Optional: routes the REST naming cannot guess, e.g. { markShipped: ['POST', '/{id}/mark-shipped'] }
    static routes: Record<string, [string, string]> = {}

    body = (request: HttpContext['request']) => RequestHelper.body(request)

    /** All matching rows (empty array when none). */
    fetchAll = async (sql: string, params: unknown[] = []) => rows(await db.rawQuery(sql, params as any[]))

    /** First matching row, or null. */
    fetchOne = async (sql: string, params: unknown[] = []) => (await this.fetchAll(sql, params))[0] ?? null

    /** Runs an INSERT and returns the new id. */
    insert = async (sql: string, params: unknown[] = []) => {
        const result = info(await db.rawQuery(sql, params as any[]))
        return Number(result.insertId ?? result.lastInsertRowid)
    }

    /** Runs an UPDATE / DELETE and returns the number of affected rows. */
    execute = async (sql: string, params: unknown[] = []) => {
        const result = info(await db.rawQuery(sql, params as any[]))
        return Number(result.affectedRows ?? result.changes ?? 0)
    }
}
