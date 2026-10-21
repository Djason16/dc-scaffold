import { useLocation } from '@solidjs/router'
import { createEffect, createSignal, on, onMount, Show } from 'solid-js'
import Footer from '@/components/layout/Footer/Footer.jsx'
import Header from '@/components/layout/Header/Header.jsx'
import BackToTop from '@/components/ui/Button/BackToTop.jsx'
// @two-languages
import ChangeLanguageButton from '@/components/ui/Button/ChangeLanguageButton.jsx'
// @end-two-languages
import Loader from '@/components/ui/Loader/Loader.jsx'
import PreferencesBanner from '@/components/ui/PreferencesBanner/PreferencesBanner.jsx'
import { useLang } from '@/composables/useLang.js'
import { design } from '@/design.js'
import { userPreferences } from '@/stores/userPreferences.js'

// Loader with the DC Scaffold design only (dc-scaffold.config.js): true = always, false = never
const LOADER_ENABLED = design
// Minimum time of the loader on a page change, so it does not just flash (milliseconds)
const LOADER_PAGE_TIME = 400

// Frame of every page (and of the 404 page): loader, header, page, footer, floating buttons, cookie banner
export default function AppShell(props) {
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

        // Fonts of utils/fonts.css loaded: the text will not change size, the loader can go
        document.fonts.ready.then(() => {
            ready = true
            setShowLoader(false)
        })
    })

    return (
        <>
            <Show when={showLoader()}>
                <Loader />
            </Show>
            <div class="app-shell" style={{ display: showLoader() ? 'none' : undefined }}>
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
