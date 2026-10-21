import type { HttpContext } from '@adonisjs/core/http'

type Request = HttpContext['request']

/**
 * Reads incoming data the same way in every controller.
 */
export const RequestHelper = {
    /** Request body and query string as one object, whether the client sent JSON or form fields. */
    body: (request: Request): Record<string, any> => request.all(),

    /** Query string value: /products?page=2 -> query(request, 'page') === '2' */
    query: (request: Request, key: string, fallback: unknown = null) => request.qs()[key] ?? fallback,

    /** Names of the required fields that are missing or empty. */
    missing: (data: Record<string, unknown>, requiredFields: string[]) =>
        requiredFields.filter((field) => data[field] === undefined || data[field] === null || data[field] === ''),
}
