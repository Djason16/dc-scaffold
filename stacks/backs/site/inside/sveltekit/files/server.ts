import { createServer } from 'node:http'
import { handler } from './build/handler.js'
import { SecurityHelper } from './src/lib/server/SecurityHelper.ts'

// Server of the site online (npm start, run by Node.js itself, TypeScript included): every page (prerendered ones included) and the API of build/,
// with the www. redirect and the security headers that the hooks of SvelteKit cannot give to prerendered pages
const port = Number(process.env.PORT ?? 3000)

createServer((req, res) => {
    // www.my-site.com -> my-site.com (301, path and parameters kept): not every host does it, the site does it itself
    const host = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? '')
    if (host.startsWith('www.')) {
        res.writeHead(301, { Location: `https://${host.slice(4)}${req.url ?? '/'}` })
        return res.end()
    }
    for (const [name, value] of Object.entries(SecurityHelper.headers(req.headers['x-forwarded-proto'] === 'https'))) res.setHeader(name, value)
    handler(req, res, () => {
        res.statusCode = 404
        res.end('Not found')
    })
}).listen(port, () => console.log(`Server ready on http://localhost:${port}`))
