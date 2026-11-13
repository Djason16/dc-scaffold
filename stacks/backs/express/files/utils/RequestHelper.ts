import type { Request } from 'express'

// A file of a form: its name, its type ("image/png"...), its size and its bytes
export type UploadedFile = { filename: string, type: string, size: number, data: Buffer }

/**
 * Reads incoming data the same way in every controller.
 */
export const RequestHelper = {
    /** Request body as an object, whether the client sent JSON or form fields. */
    body: (req: Request): Record<string, any> => (req.body && typeof req.body === 'object' ? req.body : {}),

    /** Query string value: /products?page=2 -> query(req, 'page') === '2' */
    query: (req: Request, key: string, fallback: unknown = null) => req.query[key] ?? fallback,

    /** Names of the required fields that are missing or empty. */
    missing: (data: Record<string, unknown>, requiredFields: string[]) =>
        requiredFields.filter((field) => data[field] === undefined || data[field] === null || data[field] === ''),
    /**
     * Form with files (multipart/form-data): text fields as strings, files by field name, without any extra package.
     *   const { fields, files } = await RequestHelper.multipart(req)   // files.photo = { filename, type, size, data }
     */
    async multipart(req: Request) {
        const form = await new Request('http://localhost', { method: 'POST', headers: req.headers as HeadersInit, body: req as unknown as BodyInit, duplex: 'half' } as RequestInit)
            .formData().catch(() => new FormData())
        const fields: Record<string, string> = {}
        const files: Record<string, UploadedFile> = {}
        for (const [name, value] of form) {
            if (typeof value === 'string') fields[name] = value
            else files[name] = { filename: value.name, type: value.type, size: value.size, data: Buffer.from(await value.arrayBuffer()) }
        }
        return { fields, files }
    },
}
