import { redirect } from '@sveltejs/kit'
import guards from '#lib/middleware/index.js'

// Static site in build/ (like "nuxt generate"): every page is prerendered,
// unknown paths fall back to 200.html (see adapter-static in vite.config.js)
export const prerender = true
export const trailingSlash = 'always'

// Guards of src/lib/middleware/ before every page
/** @type {import('./$types').LayoutLoad} */
export const load = ({ url }) => {
    for (const guard of guards) {
        const target = guard(url)
        if (target) redirect(307, target)
    }
}
