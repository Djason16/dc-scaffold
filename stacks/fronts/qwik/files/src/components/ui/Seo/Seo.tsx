import { component$ } from '@builder.io/qwik'
import { useDocumentHead } from '@builder.io/qwik-city'
// @two-languages
import { useLang } from '~/composables/useLang'
import { t } from '~/plugins/lang'
// @end-two-languages
import { useSite } from '~/composables/useSite'
import { buildSeo } from '~/utils/seo.js'

// @two-languages
// <head> of the current page from SEO_PAGES (utils/seo.js), written into each built page, updated on language change.
// @end-two-languages
// @one-language
// <head> of the current page from SEO_PAGES (utils/seo.js), written into each built page.
// @end-one-language
// A page gives its key with:  export const head: DocumentHead = { frontmatter: { pageKey: 'about' } }
export default component$(() => {
    // @two-languages
    const lang = useLang()
    // @end-two-languages
    const site = useSite()
    const page = useDocumentHead()
    const pageKey = page.frontmatter.pageKey ?? 'index'
    // @two-languages
    const seo = buildSeo({ pageKey, t: (key: string, values?: Record<string, string>) => t(lang, key, values), locale: lang.current, site })
    // @end-two-languages
    // @one-language
    const seo = buildSeo({ pageKey, locale: '{{DEFAULT_LANG}}', site })
    // @end-one-language
    // "<" escaped so the JSON can never close the <script> tag
    const jsonLd = seo.jsonLd ? JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c') : ''

    return (
        <>
            <title>{seo.title}</title>
            {seo.meta.map((tag) => (tag.property
                ? <meta key={tag.property} property={tag.property} content={tag.content} />
                : <meta key={tag.name} name={tag.name} content={tag.content} />))}
            {seo.link.map((link) => <link key={link.rel} rel={link.rel} href={link.href} />)}
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd} />}
        </>
    )
})
