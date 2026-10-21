import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'
import { useUserPreferencesStore } from '@/stores/userPreferences.js'

// Bottom of every page: copyright and cookie settings
export default function Footer() {
    const { getTranslation: t } = useLang()
    const site = useSite()
    const openSettings = useUserPreferencesStore((state) => state.openSettings)

    return (
        <footer className="footer">
            <div className="container">
                <p>© {new Date().getFullYear()} {site.name}. {t('allRightsReserved')}</p>
                {/* Opens the cookie banner again, on the current choice */}
                <button type="button" className="footer-link" onClick={openSettings}>{t('prefsSettings')}</button>
            </div>
        </footer>
    )
}
