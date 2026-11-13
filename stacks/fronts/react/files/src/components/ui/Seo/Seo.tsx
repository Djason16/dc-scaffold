import { useEffect } from 'react'
import { useLang } from '@/composables/useLang'
import { useSite } from '@/composables/useSite'
import { applyHead } from '@/utils/head'
import { buildSeo } from '@/utils/seo'

// @two-languages
// <head> of a page from SEO_PAGES (utils/seo.ts), updated on language change
// @end-two-languages
// @one-language
// <head> of a page from SEO_PAGES (utils/seo.ts)
// @end-one-language
export default function Seo({ pageKey }: { pageKey: string }) {
    const lang = useLang()
    const site = useSite()

    useEffect(() => {
        applyHead(buildSeo({ pageKey, t: lang.getTranslation, locale: lang.current, site }))
    }, [pageKey, lang.current, site.name, site.url])

    return null
}
