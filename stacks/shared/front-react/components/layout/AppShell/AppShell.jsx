import { useCallback, useEffect, useRef, useState } from 'react'
import Footer from '@/components/layout/Footer/Footer.jsx'
import Header from '@/components/layout/Header/Header.jsx'
import BackToTop from '@/components/ui/Button/BackToTop.jsx'
// @two-languages
import ChangeLanguageButton from '@/components/ui/Button/ChangeLanguageButton.jsx'
// @end-two-languages
import Loader from '@/components/ui/Loader/Loader.jsx'
import PreferencesBanner from '@/components/ui/PreferencesBanner/PreferencesBanner.jsx'
import { useLang } from '@/composables/useLang.js'
import { usePageChange } from '@/composables/usePageChange.js'
import { design } from '@/design.js'
import { useUserPreferencesStore } from '@/stores/userPreferences.js'

// Loader with the DC Scaffold design only (dc-scaffold.config.js): true = always, false = never
const LOADER_ENABLED = design
// Minimum time of the loader on a page change, so it does not just flash (milliseconds)
const LOADER_PAGE_TIME = 400

// Frame of every page (and of the 404 page): loader, header, page, footer, floating buttons, cookie banner
export default function AppShell({ children }) {
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

        // Fonts of utils/fonts.css loaded: the text will not change size, the loader can go
        document.fonts.ready.then(() => {
            ready.current = true
            setShowLoader(false)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            {showLoader && <Loader />}
            <div className="app-shell" style={{ display: showLoader ? 'none' : undefined }}>
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
