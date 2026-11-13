import { computed } from 'vue'
import { buildSeo } from '@/utils/seo'
import { useLang } from './useLang'
import { useSite } from './useSite'

// @two-languages
// <head> of a page from SEO_PAGES (utils/seo.ts), rendered in the generated HTML, updated on language change
// @end-two-languages
// @one-language
// <head> of a page from SEO_PAGES (utils/seo.ts), rendered in the generated HTML
// @end-one-language
export const useSeo = (pageKey: string) => {
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
