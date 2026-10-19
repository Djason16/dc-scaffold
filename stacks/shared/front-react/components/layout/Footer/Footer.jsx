import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'
import { useUserPreferencesStore } from '@/stores/userPreferences.js'

// Bottom of every page: copyright and cookie settings
export default function Footer() {
    const { getTranslation: t } = useLang()
    const site = useSite()
    const deleteCookie = useUserPreferencesStore((state) => state.deleteCookie)

    return (
        <footer className="footer">
            <div className="container">
                <p>© {new Date().getFullYear()} {site.name}. {t('allRightsReserved')}</p>
                {/* Forgets the choice: the cookie banner shows again */}
                <button type="button" className="footer-link" onClick={deleteCookie}>{t('prefsSettings')}</button>
            </div>
        </footer>
    )
}
