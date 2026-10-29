import { handleApi } from '@/server/handler.js'

// The API: every /api address, answered on each request by the controllers of server/controllers
// (the pages of pages/ stay as they are)
export const dynamic = 'force-dynamic'

export const GET = handleApi
export const POST = handleApi
export const PUT = handleApi
export const PATCH = handleApi
export const DELETE = handleApi
export const OPTIONS = handleApi
