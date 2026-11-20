import type { Component } from 'svelte'
import { SvelteURL } from 'svelte/reactivity'
import guards from '#lib/middleware/index.js'

/*
 * Pages of the site = files of src/pages (like SvelteKit):
 *   index.svelte -> /, about.svelte -> /about/, blog/[id].svelte -> /blog/123/ (params.id), [...path].svelte -> any other address
 * Links <a href="/..."> of the site change the page without reloading.
 */
// A page: a component that receives the values of its address (params)
type Page = Component<{ params: Record<string, string> }>
const pages = import.meta.glob<{ default: Page }>('../pages/**/*.svelte', { eager: true })

type Place = { url: URL }
type Navigation = { from: Place|null, to: Place, willUnload: boolean }
// A page and the regular expression of its address; the most precise ones first, [...path] last
const routes = Object.entries(pages)
    .map(([file, module]) => {
        const path = file.replace(/^.*\/pages/, '').replace(/\.svelte$/, '').replace(/\/index$/, '') || '/'
        const names: string[] = []
        const pattern = path.split('/').map((part) => {
            if (/^\[\.\.\.\w+\]$/.test(part)) { names.push(part.slice(4, -1)); return '(.*)' }
            return part.replace(/\[(\w+)\]/g, (match: string, name: string) => { names.push(name); return '([^/]+)' })
        }).join('/')
        const rank = path.includes('[...') ? 2 : path.includes('[') ? 1 : 0
        return { component: module.default, names, rank, regex: new RegExp(`^${pattern}/?$`) }
    })
    .sort((a, b) => a.rank - b.rank)

const find = (pathname: string): { component: Page | null, params: Record<string, string> } => {
    for (const route of routes) {
        const match = route.regex.exec(pathname.replace(/\/+$/, '') || '/')
        if (match) return { component: route.component, params: Object.fromEntries(route.names.map((name, index) => [name, decodeURIComponent(match[index + 1])])) }
    }
    return { component: null, params: {} }
}

// Base of the site (vite.config.ts): "/" at the root of its address, "/my-site/" in a qualif
const BASE = import.meta.env.BASE_URL
const withBase = (pathname: string) => (BASE !== '/' && !pathname.startsWith(BASE) ? BASE.replace(/\/$/, '') + pathname : pathname)
const withoutBase = (pathname: string) => (BASE !== '/' && pathname.startsWith(BASE) ? `/${pathname.slice(BASE.length)}` : pathname)

let current = $state(find(withoutBase(location.pathname)))
let currentUrl = new URL(location.href)
// Callbacks of beforeNavigate / afterNavigate (plain lists: nothing to show on the page)
const before: ((navigation: Navigation) => void)[] = []
const after: ((navigation: Navigation) => void)[] = []
const unsubscribe = (list: ((navigation: Navigation) => void)[], callback: (navigation: Navigation) => void) => () => {
    if (list.includes(callback)) list.splice(list.indexOf(callback), 1)
}

/**
 * Opens an address of the site, after the guards of src/lib/middleware
 */
export const goto = (target: string | URL, { replace = false }: { replace?: boolean } = {}): void => {
    // SvelteURL: the URL of svelte/reactivity (the address changes as the visitor navigates)
    const url = new SvelteURL(target, location.href)
    url.pathname = withBase(url.pathname)
    for (const guard of guards) {
        const redirect = guard(url)
        if (redirect) {
            goto(redirect, { replace: true })
            return
        }
    }
    const navigation = { from: { url: currentUrl }, to: { url }, willUnload: false }
    before.forEach((callback) => callback(navigation))
    history[replace ? 'replaceState' : 'pushState']({}, '', url)
    if (url.pathname !== currentUrl.pathname) window.scrollTo(0, 0)
    currentUrl = url
    current = find(withoutBase(url.pathname))
    after.forEach((callback) => callback(navigation))
}

// Same names as SvelteKit ($app/navigation): the callback runs before / after every page change, until the component goes
export const beforeNavigate = (callback: (navigation: Navigation) => void) => { before.push(callback); return unsubscribe(before, callback) }
export const afterNavigate = (callback: (navigation: Navigation) => void) => { after.push(callback); return unsubscribe(after, callback) }

// Current page: its component and the values of its address ([id] -> params.id)
export const router = {
    get page() { return current.component },
    get params() { return current.params },
}

// Guards on the first page too, then back / forward buttons of the browser and links of the site
goto(location.href, { replace: true })
window.addEventListener('popstate', () => goto(location.href, { replace: true }))
document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('a[href]')
    if (!(link instanceof HTMLAnchorElement) || event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (link.target && link.target !== '_self') || link.hasAttribute('download')) return
    const url = new URL(link.href)
    if (url.origin !== location.origin) return
    event.preventDefault()
    // Same page with an anchor (#section): only scroll
    if (url.pathname === location.pathname && url.hash) { location.hash = url.hash; return }
    goto(url)
})
