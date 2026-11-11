/*
 * Qualif of a Node.js server (Next, SvelteKit, Astro, Qwik): the site is served from a folder of its address.
 * Loaded first by "npm start" of the qualif only (scripts/qualif.mjs adds --import); the folder comes from
 * QUALIF_BASE_PATH of its .env.production ("/my-site"). Without it (dev, production), it does nothing.
 *   - the links of the pages written from the root ("/contact/", "/images/...") move into the folder;
 *   - every page gets a small script: the folder for the address of the API (globalThis.__QUALIF_BASE__), and the
 *     addresses written from the root that come with the data ("/uploads/photo.webp") moved into it in the browser;
 *   - nothing is indexed (X-Robots-Tag).
 */
import { existsSync, readFileSync } from 'node:fs'
import http from 'node:http'

// "next start" reads .env.production itself, after this module: the folder is then read in the file
const fromFile = () => {
    if (!existsSync('.env.production')) return ''
    const line = readFileSync('.env.production', 'utf8').match(/^\s*QUALIF_BASE_PATH\s*=\s*(.*?)\s*$/m)
    return line ? line[1].replace(/^(['"])(.*)\1$/, '$2') : ''
}
const PREFIX = (process.env.QUALIF_BASE_PATH || fromFile()).replace(/\/$/, '')

if (PREFIX) {
    const attribute = /(\s(?:href|src|action|poster|data-src)=["'])(\/(?!\/)[^"']*)/g
    const inside = (path) => path === PREFIX || path.startsWith(`${PREFIX}/`)
    // In the browser: the folder for the API, and the addresses shown later by the site moved into it
    const browser = `<script>(function(){var b=${JSON.stringify(PREFIX)};globalThis.__QUALIF_BASE__=b;var A=['src','href','poster'];`
        + 'function m(e){for(var i=0;i<A.length;i++){var v=e.getAttribute&&e.getAttribute(A[i]);'
        + "if(v&&v.charAt(0)==='/'&&v.charAt(1)!=='/'&&v!==b&&v.indexOf(b+'/')!==0)e.setAttribute(A[i],b+v)}}"
        + "function all(r){if(r.nodeType!==1)return;m(r);var l=r.querySelectorAll('[src],[href],[poster]');for(var i=0;i<l.length;i++)m(l[i])}"
        + "new MutationObserver(function(c){c.forEach(function(x){if(x.type==='attributes')m(x.target);else x.addedNodes.forEach(all)})})"
        + '.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:A});'
        + "document.addEventListener('DOMContentLoaded',function(){all(document.documentElement)})})();</script>"
    const move = (html) => html
        .replace(attribute, (match, before, path) => (inside(path) ? match : before + PREFIX + path))
        .replace(/<head(\s[^>]*)?>/i, (head) => head + browser)

    const wrap = (response) => {
        const { writeHead, write, end } = response
        let chunks
        // Only the pages (HTML, not compressed): they are kept until the end, then sent with their links moved
        const decide = () => {
            if (chunks !== undefined) return
            const isPage = /text\/html/.test(String(response.getHeader('content-type') ?? '')) && !response.getHeader('content-encoding')
            chunks = isPage ? [] : null
            if (isPage) response.removeHeader('content-length')
        }
        response.writeHead = function (status, message, headers) {
            if (typeof message !== 'string') [headers, message] = [message, undefined]
            if (headers && !Array.isArray(headers)) {
                for (const [name, value] of Object.entries(headers)) if (value !== undefined) response.setHeader(name, value)
                headers = undefined
            }
            decide()
            return message ? writeHead.call(this, status, message, headers) : writeHead.call(this, status, headers)
        }
        response.write = function (chunk, encoding, callback) {
            decide()
            if (!chunks) return write.call(this, chunk, encoding, callback)
            chunks.push(Buffer.from(chunk, typeof encoding === 'string' ? encoding : undefined))
            if (typeof (callback ?? encoding) === 'function') (callback ?? encoding)()
            return true
        }
        response.end = function (chunk, encoding, callback) {
            decide()
            if (!chunks) return end.call(this, chunk, encoding, callback)
            if (typeof chunk === 'function') [chunk, callback] = [undefined, chunk]
            if (typeof encoding === 'function') [encoding, callback] = [undefined, encoding]
            if (chunk) chunks.push(Buffer.from(chunk, typeof encoding === 'string' ? encoding : undefined))
            return end.call(this, move(Buffer.concat(chunks).toString('utf8')), callback)
        }
    }

    const emit = http.Server.prototype.emit
    http.Server.prototype.emit = function (event, request, response, ...rest) {
        if (event === 'request') {
            // Pages sent without compression, so their links can be read
            delete request.headers['accept-encoding']
            // Never indexed
            response.setHeader('X-Robots-Tag', 'noindex, nofollow')
            wrap(response)
        }
        return emit.call(this, event, request, response, ...rest)
    }
}
