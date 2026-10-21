import { NestFactory } from '@nestjs/core'
import type { NextFunction, Request, Response } from 'express'
import { AppModule } from './app.module.js'
import { ErrorsFilter } from './errors.filter.js'

// Settings of backend/.env (online, npm start reads .env.production instead)
if (!process.env.APP_ENV) process.loadEnvFile('.env')

const app = await NestFactory.create(AppModule)

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/
// Same CORS rules as the other back ends: only the front URL, with cookies
app.enableCors({
    origin: process.env.APP_BASE_URL ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'user_id', 'X-Requested-With'],
})
app.use((req: Request, res: Response, next: NextFunction) => {
    res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    next()
})

// Every error in the shared JSON format (errors.filter.ts)
app.useGlobalFilters(new ErrorsFilter())

/*
|--------------------------------------------------------------------------
| Run
|--------------------------------------------------------------------------
*/
const port = Number(process.env.PORT || 3000)
await app.listen(port)
console.log(`API ready on http://localhost:${port}`)
