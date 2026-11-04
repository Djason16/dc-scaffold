import { handleApi } from '#lib/server/handler.js'

// The API: every /api address, answered on each request by the controllers of src/lib/server/controllers
export const prerender = false
export const trailingSlash = 'ignore'

/** @type {import('./$types').RequestHandler} */
export const fallback = ({ request }) => handleApi(request)
