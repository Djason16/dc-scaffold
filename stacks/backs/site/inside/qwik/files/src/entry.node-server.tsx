import { createQwikCity } from '@builder.io/qwik-city/middleware/node'
import qwikCityPlan from '@qwik-city-plan'
import { manifest } from '@qwik-client-manifest'
import { createServer } from 'node:http'
import render from './entry.ssr'

// Server of the site online (npm start): the files of dist/, then the pages and the API of src/routes
const { router, notFound, staticFile } = createQwikCity({ render, qwikCityPlan, manifest })

const port = Number(process.env.PORT ?? 3000)

createServer((req, res) => {
    staticFile(req, res, () => {
        router(req, res, () => {
            notFound(req, res, () => {})
        })
    })
}).listen(port, () => console.log(`Server ready on http://localhost:${port}`))
