import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from '@nestjs/common'
import type { Request, Response } from 'express'
import { ResponseHelper } from './utils/ResponseHelper.js'

// Turns every uncaught error into the shared JSON format
@Catch()
export class ErrorsFilter implements ExceptionFilter {
    catch(error: unknown, host: ArgumentsHost) {
        const res = host.switchToHttp().getResponse<Response>()
        const req = host.switchToHttp().getRequest<Request>()
        const status = error instanceof HttpException ? error.getStatus() : 500

        if (status === 404) return ResponseHelper.error(res, 'Route not found', 404, 'NOT_FOUND', { path: req.path })
        if (status < 500) return ResponseHelper.error(res, error instanceof Error ? error.message : 'Error', status, 'HTTP_ERROR')

        console.error('[API]', error)
        // Real message in development only, never leak internals in production
        const message = process.env.APP_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error'
        return ResponseHelper.serverError(res, message)
    }
}
