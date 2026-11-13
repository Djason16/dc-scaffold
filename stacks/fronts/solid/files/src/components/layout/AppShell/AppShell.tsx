import { useLocation } from '@solidjs/router'
import { createEffect, createSignal, on, onMount, Show, type ParentProps } from 'solid-js'
import Footer from '@/components/layout/Footer/Footer'
import Header from '@/components/layout/Header/Header'
import BackToTop from '@/components/ui/Button/BackToTop'
// @two-languages
import ChangeLanguageButton from '@/components/ui/Button/ChangeLanguageButton'
// @end-two-languages
import Loader from '@/components/ui/Loader/Loader'
import PreferencesBanner from '@/components/ui/PreferencesBanner/PreferencesBanner'
import { useLang } from '@/composables/useLang'
import { design } from '@/design'
import { userPreferences } from '@/stores/userPreferences'

// Loader with the DC Scaffold design only (dc-scaffold.config.js): true = always, false = never
const LOADER_ENABLED = design
// Minimum time of the loader on a page change, so it does not just flash (milliseconds)
const LOADER_PAGE_TIME = 400
// Longest wait of the loader on the first opening, even if the fonts are not there yet (milliseconds)
const LOADER_FIRST_MAX_TIME = 2000

// Frame of every page (and of the 404 page): loader, header, page, footer, floating buttons, cookie banner
export default function AppShell(props: ParentProps) {
    const lang = useLang()
    const location = useLocation()
    const [showLoader, setShowLoader] = createSignal(LOADER_ENABLED)
    let ready = false

    // Loader again on every page change (not on the first page: it is already shown while the site starts)
    createEffect(on(() => location.pathname, () => {
        if (!LOADER_ENABLED || !ready) return
        setShowLoader(true)
        setTimeout(() => setShowLoader(false), LOADER_PAGE_TIME)
    }, { defer: true }))

    onMount(() => {
        // Choice saved during a previous visit (cookie)
        userPreferences.loadPreferences()

        // @two-languages
        // Language of a previous visit, only if the visitor accepted functional cookies
        if (userPreferences.preferences.functional) lang.restore()
        // @end-two-languages

        // Fonts of utils/fonts.css loaded (the text will not change size), or 2 seconds at most: the loader goes
        Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, LOADER_FIRST_MAX_TIME))]).then(() => {
            ready = true
            setShowLoader(false)
        })
    })

    return (
        <>
            {/* The loader covers the page, which is already there under it (search engines, speed) */}
            <Show when={showLoader()}>
                <Loader />
            </Show>
            <div class="app-shell">
                <Header />
                <main>{props.children}</main>
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
}
