import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'
import { userPreferences } from '@/stores/userPreferences.js'

// Bottom of every page: copyright and cookie settings
export default function Footer() {
    const { getTranslation: t } = useLang()
    const site = useSite()

    return (
        <footer class="footer">
            <div class="container">
                <p>© {new Date().getFullYear()} {site.name}. {t('allRightsReserved')}</p>
                {/* Opens the cookie banner again, on the current choice */}
                <button type="button" class="footer-link" onClick={() => userPreferences.openSettings()}>{t('prefsSettings')}</button>
            </div>
        </footer>
    )
}
