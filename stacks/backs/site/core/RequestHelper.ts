/**
 * Reads incoming data the same way in every controller.
 */
export const RequestHelper = {
    /**
     * Request body as an object, whether the client sent JSON or form fields.
     */
    async body(request: Request): Promise<Record<string, any>> {
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
     */
    query(request: Request, key: string, fallback: unknown = null) {
        return new URL(request.url).searchParams.get(key) ?? fallback
    },

    /**
     * Names of the required fields that are missing or empty.
     */
    missing(data: Record<string, unknown>, requiredFields: string[]) {
        return requiredFields.filter((field) => data[field] === undefined || data[field] === null || data[field] === '')
    },
    /**
     * Form with files (multipart/form-data): text fields as strings, files by field name.
     *   const { fields, files } = await RequestHelper.multipart(request)   // files.photo = { filename, type, size, data }
     */
    async multipart(request: Request) {
        const form = await request.formData().catch(() => new FormData())
        const fields: Record<string, string> = {}
        const files: Record<string, { filename: string, type: string, size: number, data: Buffer }> = {}
        for (const [name, value] of form) {
            if (typeof value === 'string') fields[name] = value
            else files[name] = { filename: value.name, type: value.type, size: value.size, data: Buffer.from(await value.arrayBuffer()) }
        }
        return { fields, files }
    },
}
