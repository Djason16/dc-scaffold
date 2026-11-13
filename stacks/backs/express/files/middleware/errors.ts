import type { NextFunction, Request, Response } from 'express'
import { ResponseHelper } from '../utils/ResponseHelper.ts'

// Turns every uncaught error into the shared JSON format
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('[API]', error)

    // Real message in development only, never leak internals in production
    const message = process.env.APP_ENV === 'development' ? error.message : 'Internal server error'
    return ResponseHelper.serverError(res, message)
}
