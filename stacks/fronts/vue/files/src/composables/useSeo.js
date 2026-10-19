import { watchEffect } from 'vue'
import { applyHead } from '@/utils/head.js'
import { buildSeo } from '@/utils/seo.js'
import { useLang } from './useLang.js'
import { useSite } from './useSite.js'

// @two-languages
// <head> of a page from SEO_PAGES (utils/seo.js), updated on language change
// @end-two-languages
// @one-language
// <head> of a page from SEO_PAGES (utils/seo.js)
// @end-one-language
export const useSeo = (pageKey) => {
    const lang = useLang()
    const site = useSite()
    watchEffect(() => applyHead(buildSeo({ pageKey, t: lang.getTranslation, locale: lang.current.value, site })))
}
