import { effect } from '@angular/core'
// @two-languages
import { useLang } from '@/composables/useLang'
// @end-two-languages
import { useSite } from '@/composables/useSite'
import { applyHead } from '@/utils/head.js'
import { buildSeo } from '@/utils/seo.js'

// @two-languages
// <head> of a page from SEO_PAGES (utils/seo.js), updated on language change. In a page: useSeo('index')
export const useSeo = (pageKey: string) => {
    const lang = useLang()
    const site = useSite()
    effect(() => {
        applyHead(buildSeo({ pageKey, t: (key: string, values?: Record<string, string>) => lang.getTranslation(key, values), locale: lang.current(), site }))
    })
}
// @end-two-languages
// @one-language
// <head> of a page from SEO_PAGES (utils/seo.js). In a page: useSeo('index')
export const useSeo = (pageKey: string) => {
    applyHead(buildSeo({ pageKey, locale: '{{DEFAULT_LANG}}', site: useSite() }))
}
// @end-one-language
