import { handleApi } from '../../server/handler'

// The API: every /api address, answered on each request by the controllers of src/server/controllers
// (the pages of the site stay prerendered)
export const prerender = false

export const ALL: import('astro').APIRoute = ({ request }) => handleApi(request)
