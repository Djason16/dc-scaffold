import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Footer from '@/components/layout/Footer/Footer'
import Header from '@/components/layout/Header/Header'
import BackToTop from '@/components/ui/Button/BackToTop'
// @two-languages
import ChangeLanguageButton from '@/components/ui/Button/ChangeLanguageButton'
// @end-two-languages
import Loader from '@/components/ui/Loader/Loader'
import PreferencesBanner from '@/components/ui/PreferencesBanner/PreferencesBanner'
import { useLang } from '@/composables/useLang'
import { usePageChange } from '@/composables/usePageChange'
import { design } from '@/design'
import { useUserPreferencesStore } from '@/stores/userPreferences'

// Loader with the DC Scaffold design only (dc-scaffold.config.js): true = always, false = never
const LOADER_ENABLED = design
// Minimum time of the loader on a page change, so it does not just flash (milliseconds)
const LOADER_PAGE_TIME = 400
// Longest wait of the loader on the first opening, even if the fonts are not there yet (milliseconds)
const LOADER_FIRST_MAX_TIME = 2000

// Frame of every page (and of the 404 page): loader, header, page, footer, floating buttons, cookie banner
export default function AppShell({ children }: { children: ReactNode }) {
    const lang = useLang()
    const [showLoader, setShowLoader] = useState(LOADER_ENABLED)
    const ready = useRef(false)
    const shownAt = useRef(0)

    // Loader again on every page change: shown when the navigation starts, hidden once the new page is there
    const startLoader = useCallback(() => {
        if (!LOADER_ENABLED || !ready.current) return
        shownAt.current = Date.now()
        setShowLoader(true)
    }, [])
    const endLoader = useCallback(() => {
        if (!ready.current) return
        setTimeout(() => setShowLoader(false), Math.max(0, LOADER_PAGE_TIME - (Date.now() - shownAt.current)))
    }, [])
    usePageChange(startLoader, endLoader)

    useEffect(() => {
        // Choice saved during a previous visit (cookie)
        useUserPreferencesStore.getState().loadPreferences()

        // @two-languages
        // Language of a previous visit, only if the visitor accepted functional cookies
        if (useUserPreferencesStore.getState().preferences.functional) lang.restore()
        // @end-two-languages

        // Fonts of utils/fonts.css loaded (the text will not change size), or 2 seconds at most: the loader goes
        Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, LOADER_FIRST_MAX_TIME))]).then(() => {
            ready.current = true
            setShowLoader(false)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            {/* The loader covers the page, which is already there under it (search engines, speed) */}
            {showLoader && <Loader />}
            <div className="app-shell">
                <Header />
                <main>{children}</main>
                <Footer />

                {/* Buttons floating at the bottom right */}
                <div className="floating-controls">
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
