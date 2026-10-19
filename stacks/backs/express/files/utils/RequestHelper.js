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
}
