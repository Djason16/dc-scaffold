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
    const { name, url } = useSite()
    // @two-languages
    const { current, getTranslation } = useLang()

    useEffect(() => {
        applyHead(buildSeo({ pageKey, t: getTranslation, locale: current, site: { name, url } }))
    }, [pageKey, current, getTranslation, name, url])
    // @end-two-languages
    // @one-language

    useEffect(() => {
        applyHead(buildSeo({ pageKey, locale: lang.current, site: { name, url } }))
    }, [pageKey, name, url])
    // @end-one-language

    return null
}