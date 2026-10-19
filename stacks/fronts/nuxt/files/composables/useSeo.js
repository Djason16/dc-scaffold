import { computed } from 'vue'
import { buildSeo } from '@/utils/seo.js'
import { useLang } from './useLang.js'
import { useSite } from './useSite.js'

// @two-languages
// <head> of a page from SEO_PAGES (utils/seo.js), rendered in the generated HTML, updated on language change
// @end-two-languages
// @one-language
// <head> of a page from SEO_PAGES (utils/seo.js), rendered in the generated HTML
// @end-one-language
export const useSeo = (pageKey) => {
    const lang = useLang()
    const site = useSite()
    const seo = computed(() => buildSeo({ pageKey, t: lang.getTranslation, locale: lang.current.value, site }))

    useHead(computed(() => ({
        title: seo.value.title,
        meta: seo.value.meta,
        link: seo.value.link,
        script: seo.value.jsonLd ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(seo.value.jsonLd) }] : [],
    })))
}
