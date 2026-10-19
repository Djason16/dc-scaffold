// Same CORS rules as the other back ends: only the front URL, with cookies
export default defineEventHandler((event) => {
    const handled = handleCors(event, {
        origin: [process.env.APP_BASE_URL ?? 'http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'user_id', 'X-Requested-With'],
    })

    // Preflight requests stop here
    if (handled) return null
})
