import { component$, Slot, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik'
import { useLocation } from '@builder.io/qwik-city'
import Footer from '~/components/layout/Footer/Footer'
import Header from '~/components/layout/Header/Header'
import BackToTop from '~/components/ui/Button/BackToTop'
// @two-languages
import ChangeLanguageButton from '~/components/ui/Button/ChangeLanguageButton'
// @end-two-languages
import Loader from '~/components/ui/Loader/Loader'
import PreferencesBanner from '~/components/ui/PreferencesBanner/PreferencesBanner'
// @two-languages
import { useLang } from '~/composables/useLang'
import { restoreLang } from '~/plugins/lang'
// @end-two-languages
import { design } from '~/design.js'
import { useUserPreferences, withActions } from '~/stores/userPreferences'

// Loader with the DC Scaffold design only (dc-scaffold.config.js): true = always, false = never
const LOADER_ENABLED: boolean = design
// Minimum time of the loader on a page change, so it does not just flash (milliseconds)
const LOADER_PAGE_TIME = 400
// Longest wait of the loader on the first opening, even if the fonts are not there yet (milliseconds)
const LOADER_FIRST_MAX_TIME = 2000

// Frame of every page (and of the 404 page): loader, header, page, footer, floating buttons, cookie banner
export default component$(() => {
    // @two-languages
    const lang = useLang()
    // @end-two-languages
    const userPreferences = useUserPreferences()
    const location = useLocation()
    const showLoader = useSignal(LOADER_ENABLED)
    const ready = useSignal(false)
    const shownAt = useSignal(0)

    // Loader again on every page change: shown when the navigation starts, hidden once the new page is there
    useTask$(({ track }) => {
        const navigating = track(() => location.isNavigating)
        if (!LOADER_ENABLED || !ready.value) return
        if (navigating) {
            showLoader.value = true
            shownAt.value = Date.now()
            return
        }
        setTimeout(() => (showLoader.value = false), Math.max(0, LOADER_PAGE_TIME - (Date.now() - shownAt.value)))
    })

    // In the browser, as soon as the page is there
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async () => {
        // Choice saved during a previous visit (cookie)
        withActions(userPreferences).loadPreferences()

        // @two-languages
        // Language of a previous visit, only if the visitor accepted functional cookies
        if (userPreferences.preferences.functional) restoreLang(lang)
        // @end-two-languages

        // Fonts of utils/fonts.css loaded (the text will not change size), or 2 seconds at most: the loader goes
        await Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, LOADER_FIRST_MAX_TIME))])
        showLoader.value = false
        ready.value = true
    }, { strategy: 'document-ready' })

    return (
        <>
            {/* The loader covers the page, which is already there under it (search engines, speed) */}
            {showLoader.value && <Loader />}
            <div class="app-shell">
                <Header />
                <main>
                    <Slot />
                </main>
                <Footer />

                {/* Buttons floating at the bottom right */}
                <div class="floating-controls">
                    <BackToTop />
                    {/* @two-languages */}
                    <ChangeLanguageButton />
                    {/* @end-two-languages */}
                </div>

                <PreferencesBanner />
            </div>
        </>
    )
})
