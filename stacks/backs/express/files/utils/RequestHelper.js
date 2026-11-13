/**
 * Reads incoming data the same way in every controller.
 */
export const RequestHelper = {
    /** Request body as an object, whether the client sent JSON or form fields. */
    body: (req) => (req.body && typeof req.body === 'object' ? req.body : {}),

    /** Query string value: /products?page=2 -> query(req, 'page') === '2' */
    query: (req, key, fallback = null) => req.query[key] ?? fallback,

    /** Names of the required fields that are missing or empty. */
    missing: (data, requiredFields) =>
        requiredFields.filter((field) => data[field] === undefined || data[field] === null || data[field] === ''),
    /**
     * Form with files (multipart/form-data): text fields as strings, files by field name, without any extra package.
     *   const { fields, files } = await RequestHelper.multipart(req)   // files.photo = { filename, type, size, data }
     */
    async multipart(req) {
        const form = await new Request('http://localhost', { method: 'POST', headers: req.headers, body: req, duplex: 'half' })
            .formData().catch(() => new FormData())
        const fields = {}
        const files = {}
        for (const [name, value] of form) {
            if (typeof value === 'string') fields[name] = value
            else files[name] = { filename: value.name, type: value.type, size: value.size, data: Buffer.from(await value.arrayBuffer()) }
        }
        return { fields, files }
    },
}
