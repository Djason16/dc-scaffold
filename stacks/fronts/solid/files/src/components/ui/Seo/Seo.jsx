import { createEffect } from 'solid-js'
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
export default function Seo(props) {
    const lang = useLang()
    const site = useSite()

    createEffect(() => {
        applyHead(buildSeo({ pageKey: props.pageKey, t: lang.getTranslation, locale: lang.current, site }))
    })

    return null
}
