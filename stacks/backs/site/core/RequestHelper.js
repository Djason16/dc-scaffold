/**
 * Reads incoming data the same way in every controller.
 */
export const RequestHelper = {
    /**
     * Request body as an object, whether the client sent JSON or form fields.
     * @param {Request} request
     * @returns {Promise<Record<string, any>>}
     */
    async body(request) {
        try {
            const type = request.headers.get('content-type') ?? ''
            if (type.includes('application/json')) return (await request.json()) ?? {}
            if (type.includes('form')) return Object.fromEntries(await request.formData())
        } catch {
            // Empty or invalid body
        }
        return {}
    },

    /**
     * Query string value: /products?page=2 -> query(request, 'page') === '2'
     * @param {Request} request
     * @param {string} key
     * @param {unknown} [fallback]
     */
    query(request, key, fallback = null) {
        return new URL(request.url).searchParams.get(key) ?? fallback
    },

    /**
     * Names of the required fields that are missing or empty.
     * @param {Record<string, unknown>} data
     * @param {string[]} requiredFields
     */
    missing(data, requiredFields) {
        return requiredFields.filter((field) => data[field] === undefined || data[field] === null || data[field] === '')
    },
}
