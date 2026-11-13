import Head from 'next/head'
import { useLang } from '@/composables/useLang'
import { useSite } from '@/composables/useSite'
import { buildSeo } from '@/utils/seo'

// @two-languages
// <head> of a page from SEO_PAGES (utils/seo.ts): written in the exported HTML, updated on language change
// @end-two-languages
// @one-language
// <head> of a page from SEO_PAGES (utils/seo.ts): written in the exported HTML
// @end-one-language
export default function Seo({ pageKey }: { pageKey: string }) {
    const lang = useLang()
    const seo = buildSeo({ pageKey, t: lang.getTranslation, locale: lang.current, site: useSite() })

    return (
        <Head>
            <title>{seo.title}</title>
            {seo.meta.map((tag) => (
                <meta key={'name' in tag ? tag.name : tag.property} {...tag} />
            ))}
            {seo.link.map((link) => (
                <link key={link.rel} {...link} />
            ))}
            {seo.jsonLd && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.jsonLd) }} />
            )}
        </Head>
    )
}
