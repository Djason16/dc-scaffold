import type { RequestHandler } from '@builder.io/qwik-city'
import { handleApi } from '../../../server/handler.js'

// The API: every /api address, answered on each request by the controllers of src/server/controllers
export const onRequest: RequestHandler = async ({ request, send }) => {
    send(await handleApi(request))
}
