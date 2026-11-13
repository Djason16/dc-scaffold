/**
 * Every JSON response of the API goes through this object.
 *
 * Success: { "success": true, ...data }
 * Error:   { "success": false, "error": "message", "type": "VALIDATION_ERROR" }
 */
export const ResponseHelper = {
    respond(data: Record<string, unknown>, status: number = 200) {
        return new Response(JSON.stringify(data, null, 2), { status, headers: { 'Content-Type': 'application/json' } })
    },

    success(data: Record<string, unknown> = {}, status: number = 200) {
        return ResponseHelper.respond({ success: true, ...data }, status)
    },

    error(message: string, status: number = 400, type: string = 'ERROR', extra: Record<string, unknown> = {}) {
        return ResponseHelper.respond({ success: false, error: message, type, ...extra }, status)
    },

    validationError: (message: string) => ResponseHelper.error(message, 400, 'VALIDATION_ERROR'),
    authError: (message = 'Not authenticated') => ResponseHelper.error(message, 401, 'AUTH_ERROR'),
    forbidden: (message = 'Access denied') => ResponseHelper.error(message, 403, 'FORBIDDEN'),
    notFound: (message = 'Resource not found') => ResponseHelper.error(message, 404, 'NOT_FOUND'),
    serverError: (message = 'Internal server error') => ResponseHelper.error(message, 500, 'SERVER_ERROR'),
    /**
     * Limit of tries reached (429): "Retry-After" tells the browser when to try again (in seconds)
     */
    tooManyRequests(message: string = 'Too many attempts', retryAfter: number = 0) {
        const response = ResponseHelper.error(message, 429, 'TOO_MANY_REQUESTS', retryAfter ? { retryAfter } : {})
        if (retryAfter) response.headers.set('Retry-After', String(retryAfter))
        return response
    },
}
