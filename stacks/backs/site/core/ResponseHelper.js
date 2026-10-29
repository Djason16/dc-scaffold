/**
 * Every JSON response of the API goes through this object.
 *
 * Success: { "success": true, ...data }
 * Error:   { "success": false, "error": "message", "type": "VALIDATION_ERROR" }
 */
export const ResponseHelper = {
    /**
     * @param {Record<string, unknown>} data
     * @param {number} [status]
     */
    respond(data, status = 200) {
        return new Response(JSON.stringify(data, null, 2), { status, headers: { 'Content-Type': 'application/json' } })
    },

    /**
     * @param {Record<string, unknown>} [data]
     * @param {number} [status]
     */
    success(data = {}, status = 200) {
        return ResponseHelper.respond({ success: true, ...data }, status)
    },

    /**
     * @param {string} message
     * @param {number} [status]
     * @param {string} [type]
     * @param {Record<string, unknown>} [extra]
     */
    error(message, status = 400, type = 'ERROR', extra = {}) {
        return ResponseHelper.respond({ success: false, error: message, type, ...extra }, status)
    },

    /** @param {string} message */
    validationError: (message) => ResponseHelper.error(message, 400, 'VALIDATION_ERROR'),
    authError: (message = 'Not authenticated') => ResponseHelper.error(message, 401, 'AUTH_ERROR'),
    forbidden: (message = 'Access denied') => ResponseHelper.error(message, 403, 'FORBIDDEN'),
    notFound: (message = 'Resource not found') => ResponseHelper.error(message, 404, 'NOT_FOUND'),
    serverError: (message = 'Internal server error') => ResponseHelper.error(message, 500, 'SERVER_ERROR'),
}
