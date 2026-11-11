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
    /**
     * Form with files (multipart/form-data): text fields as strings, files by field name.
     *   const { fields, files } = await RequestHelper.multipart(request)   // files.photo = { filename, type, size, data }
     * @param {Request} request
     */
    async multipart(request) {
        const form = await request.formData().catch(() => new FormData())
        /** @type {Record<string, string>} */
        const fields = {}
        /** @type {Record<string, { filename: string, type: string, size: number, data: Buffer }>} */
        const files = {}
        for (const [name, value] of form) {
            if (typeof value === 'string') fields[name] = value
            else files[name] = { filename: value.name, type: value.type, size: value.size, data: Buffer.from(await value.arrayBuffer()) }
        }
        return { fields, files }
    },
}
