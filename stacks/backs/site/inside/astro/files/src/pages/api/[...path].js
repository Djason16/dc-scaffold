import { handleApi } from '../../server/handler.js'

// The API: every /api address, answered on each request by the controllers of src/server/controllers
// (the pages of the site stay prerendered)
export const prerender = false

/** @type {import('astro').APIRoute} */
export const ALL = ({ request }) => handleApi(request)
