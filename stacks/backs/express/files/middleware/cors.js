// Same CORS rules as the other back ends: only the front URL, with cookies
export const cors = (req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': process.env.APP_BASE_URL ?? 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, user_id, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    })

    // Preflight requests stop here
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
}
