/*
 * Qualif (site served from a folder, the base set by scripts/qualif.mjs from .env.preprod): the addresses written from
 * the root that come with the data ("/uploads/products/photo.webp", "/images/...") are moved into the folder, also
 * when Vue shows them again after the first display. At the root of its address (dev, production), it does nothing.
 */
export default defineNuxtPlugin(() => {
    const base = useRuntimeConfig().app.baseURL || '/'
    if (base === '/') return
    const prefix = base.replace(/\/$/, '')
    const ATTRIBUTES = ['src', 'href', 'poster']
    const move = (element) => {
        for (const name of ATTRIBUTES) {
            const value = element.getAttribute?.(name)
            if (value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith(base)) element.setAttribute(name, `${prefix}${value}`)
        }
    }
    const moveAll = (root) => {
        if (root.nodeType !== 1) return
        move(root)
        root.querySelectorAll('[src], [href], [poster]').forEach(move)
    }
    moveAll(document.documentElement)
    new MutationObserver((changes) => {
        for (const change of changes) {
            if (change.type === 'attributes') move(change.target)
            else change.addedNodes.forEach(moveAll)
        }
    }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ATTRIBUTES })
})
