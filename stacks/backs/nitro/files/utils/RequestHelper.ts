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

    /**
     * Form with files (multipart/form-data): text fields as strings, files by field name.
     *   const { fields, files } = await RequestHelper.multipart(event)   // files.photo = { filename, type, size, data }
     */
    async multipart(event: H3Event) {
        const parts = (await readMultipartFormData(event).catch(() => null)) ?? []
        const fields: Record<string, string> = {}
        const files: Record<string, { filename: string, type: string, size: number, data: Buffer }> = {}
        for (const part of parts) {
            if (!part.name) continue
            if (part.filename) files[part.name] = { filename: part.filename, type: part.type ?? '', size: part.data.length, data: part.data }
            else fields[part.name] = part.data.toString('utf-8')
        }
        return { fields, files }
    },
}
