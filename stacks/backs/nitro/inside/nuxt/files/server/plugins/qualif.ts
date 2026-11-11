// Qualif (site served from a folder, the base set by scripts/qualif.mjs from .env.preprod): the addresses written from
// the root in the pages ("/images/logo.png", "/api/...") are moved into the folder, and nothing is indexed.
// At the root of its address (dev, production), this plugin does nothing.
export default defineNitroPlugin((nitroApp) => {
    const base = useRuntimeConfig().app.baseURL || '/'
    if (base === '/') return
    const prefix = base.replace(/\/$/, '')
    const attribute = /(\s(?:src|href|poster|action|data-src)=")(\/[^"]*)"/g
    const cssUrl = /(url\((['"]?))(\/[^'")]*)/g
    const outside = (path: string) => !path.startsWith(base) && !path.startsWith('//')

    nitroApp.hooks.hook('render:response', (response) => {
        response.headers = { ...response.headers, 'x-robots-tag': 'noindex, nofollow' }
        if (typeof response.body !== 'string') return
        response.body = response.body
            .replace(attribute, (match, before: string, path: string) => (outside(path) ? `${before}${prefix}${path}"` : match))
            .replace(cssUrl, (match, before: string, quote: string, path: string) => (outside(path) ? `${before}${prefix}${path}` : match))
    })
})
