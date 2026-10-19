// Turns every uncaught error into the shared JSON format
export default defineNitroErrorHandler((error, event) => {
    const statusCode = error.statusCode || 500
    const path = getRequestURL(event).pathname

    const body =
        statusCode === 404 ? { success: false, error: 'Route not found', type: 'NOT_FOUND', path }
        : statusCode === 405 ? { success: false, error: 'Method not allowed', type: 'METHOD_NOT_ALLOWED' }
        : statusCode < 500 ? { success: false, error: error.statusMessage || error.message, type: 'HTTP_ERROR' }
        // Real message in development only, never leak internals in production
        : { success: false, error: import.meta.dev ? error.message : 'Internal server error', type: 'SERVER_ERROR' }

    if (statusCode >= 500) console.error('[API]', error)

    setResponseStatus(event, statusCode)
    setResponseHeader(event, 'Content-Type', 'application/json')
    return send(event, JSON.stringify(body, null, 2))
})
