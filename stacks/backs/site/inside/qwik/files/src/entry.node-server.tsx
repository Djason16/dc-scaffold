import { createQwikCity } from '@builder.io/qwik-city/middleware/node'
import qwikCityPlan from '@qwik-city-plan'
import { manifest } from '@qwik-client-manifest'
import { createServer } from 'node:http'
import render from './entry.ssr'
import { SecurityHelper } from './server/SecurityHelper.js'

// Server of the site online (npm start): the files of dist/, then the pages and the API of src/routes
const { router, notFound, staticFile } = createQwikCity({ render, qwikCityPlan, manifest })

const port = Number(process.env.PORT ?? 3000)

createServer((req, res) => {
    // www.my-site.com -> my-site.com (301, path and parameters kept): not every host does it, the site does it itself
    const host = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? '')
    if (host.startsWith('www.')) {
        res.writeHead(301, { Location: `https://${host.slice(4)}${req.url ?? '/'}` })
        res.end()
        return
    }
    // Security headers on every page, file and answer of the API (server/SecurityHelper.ts)
    for (const [name, value] of Object.entries(SecurityHelper.headers(req.headers['x-forwarded-proto'] === 'https'))) res.setHeader(name, value)
    staticFile(req, res, () => {
        router(req, res, () => {
            notFound(req, res, () => {})
        })
    })
}).listen(port, () => console.log(`Server ready on http://localhost:${port}`))
