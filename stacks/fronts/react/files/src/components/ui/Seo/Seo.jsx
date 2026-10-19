import { useEffect } from 'react'
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'
import { applyHead } from '@/utils/head.js'
import { buildSeo } from '@/utils/seo.js'

// @two-languages
// <head> of a page from SEO_PAGES (utils/seo.js), updated on language change
// @end-two-languages
// @one-language
// <head> of a page from SEO_PAGES (utils/seo.js)
// @end-one-language
export default function Seo({ pageKey }) {
    const lang = useLang()
    const site = useSite()

    useEffect(() => {
        applyHead(buildSeo({ pageKey, t: lang.getTranslation, locale: lang.current, site }))
    }, [pageKey, lang.current, site.name, site.url])

    return null
}
