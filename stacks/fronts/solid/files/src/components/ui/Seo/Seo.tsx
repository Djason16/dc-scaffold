import { createEffect } from 'solid-js'
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
export default function Seo(props: { pageKey: string }) {
    const lang = useLang()
    const site = useSite()

    createEffect(() => {
        applyHead(buildSeo({ pageKey: props.pageKey, t: lang.getTranslation, locale: lang.current, site }))
    })

    return null
}
