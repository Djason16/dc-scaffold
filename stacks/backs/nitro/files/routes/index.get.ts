// Base route
export default defineEventHandler((event) =>
    ResponseHelper.success(event, {
        message: 'API ready',
        name: process.env.APP_NAME ?? 'API',
        environment: process.env.APP_ENV ?? 'development',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        current_time: new Date().toLocaleString('sv-SE', { timeZone: process.env.DB_TIMEZONE ?? 'Europe/Paris' }),
    }),
)
