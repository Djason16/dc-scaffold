import type { H3Event } from 'h3'

/**
 * Reads incoming data the same way in every controller.
 */
export const RequestHelper = {
    /** Request body as an object, whether the client sent JSON or form fields. */
    async body(event: H3Event): Promise<Record<string, any>> {
        const body = await readBody(event).catch(() => null)
        return body && typeof body === 'object' ? body : {}
    },

    /** Query string value: /products?page=2 -> query(event, 'page') === '2' */
    query(event: H3Event, key: string, fallback: unknown = null) {
        return getQuery(event)[key] ?? fallback
    },

    /** Names of the required fields that are missing or empty. */
    missing(data: Record<string, unknown>, requiredFields: string[]) {
        return requiredFields.filter((field) => data[field] === undefined || data[field] === null || data[field] === '')
    },
}
