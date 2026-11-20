import { useLang } from '@/composables/useLang'
import { useSite } from '@/composables/useSite'
import { useUserPreferencesStore } from '@/stores/userPreferences'

// Year of the copyright, read once when the site loads (not during each render)
const YEAR = new Date().getFullYear()

// Bottom of every page: copyright and cookie settings
export default function Footer() {
    const { getTranslation: t } = useLang()
    const site = useSite()
    const openSettings = useUserPreferencesStore((state) => state.openSettings)

    return (
        <footer className="footer">
            <div className="container">
                <p>© {YEAR} {site.name}. {t('allRightsReserved')}</p>
                {/* Opens the cookie banner again, on the current choice */}
                <button type="button" className="footer-link" onClick={openSettings}>{t('prefsSettings')}</button>
            </div>
        </footer>
    )
}
