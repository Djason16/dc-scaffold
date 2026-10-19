// Writes the result of buildSeo() into <head>, for fronts rendered in the browser (SPA, static HTML)
const upsert = (selector, create) => document.head.querySelector(selector) ?? document.head.appendChild(create())

export const applyHead = (seo) => {
    if (typeof document === 'undefined') return
    document.title = seo.title

    for (const tag of seo.meta) {
        const [attribute, key] = tag.property ? ['property', tag.property] : ['name', tag.name]
        const element = upsert(`meta[${attribute}="${key}"]`, () => document.createElement('meta'))
        element.setAttribute(attribute, key)
        element.setAttribute('content', tag.content)
    }

    for (const link of seo.link) {
        const element = upsert(`link[rel="${link.rel}"]`, () => document.createElement('link'))
        element.setAttribute('rel', link.rel)
        element.setAttribute('href', link.href)
    }

    const script = upsert('script#seo-json-ld', () => Object.assign(document.createElement('script'), { id: 'seo-json-ld', type: 'application/ld+json' }))
    script.textContent = seo.jsonLd ? JSON.stringify(seo.jsonLd) : ''
}
