import { watchEffect } from 'vue'
import { applyHead } from '@/utils/head'
import { buildSeo } from '@/utils/seo'
import { useLang } from './useLang'
import { useSite } from './useSite'

// @two-languages
// <head> of a page from SEO_PAGES (utils/seo.ts), updated on language change
// @end-two-languages
// @one-language
// <head> of a page from SEO_PAGES (utils/seo.ts)
// @end-one-language
export const useSeo = (pageKey: string) => {
    const lang = useLang()
    const site = useSite()
    watchEffect(() => applyHead(buildSeo({ pageKey, t: lang.getTranslation, locale: lang.current.value, site })))
}
