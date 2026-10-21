import { component$ } from '@builder.io/qwik'
import { useLang } from '~/composables/useLang'
import { t } from '~/plugins/lang'
import { useSite } from '~/composables/useSite'
import { useUserPreferences, withActions } from '~/stores/userPreferences'

// Bottom of every page: copyright and cookie settings
export default component$(() => {
    const lang = useLang()
    const site = useSite()
    const userPreferences = useUserPreferences()

    return (
        <footer class="footer">
            <div class="container">
                <p>© {new Date().getFullYear()} {site.name}. {t(lang, 'allRightsReserved')}</p>
                {/* Opens the cookie banner again, on the current choice */}
                <button type="button" class="footer-link" onClick$={() => withActions(userPreferences).openSettings()}>{t(lang, 'prefsSettings')}</button>
            </div>
        </footer>
    )
})
