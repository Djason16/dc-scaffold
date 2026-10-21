import { component$ } from '@builder.io/qwik'
import FloatingButton from '~/components/ui/Button/FloatingButton'
import { useLang } from '~/composables/useLang'
import { setLang, t } from '~/plugins/lang'
import { LANGUAGES } from '~/plugins/translations/translations.js'
import { useUserPreferences } from '~/stores/userPreferences'

// One button per language of plugins/translations/translations.js (nothing when the site has one language)
export default component$(() => {
    const lang = useLang()
    const userPreferences = useUserPreferences()

    if (LANGUAGES.length < 2) return null

    return (
        <div class="language-switcher">
            {LANGUAGES.map((code) => (
                <FloatingButton key={code}
                    class={lang.current === code ? 'active' : ''}
                    aria-label={t(lang, 'switchToLang', { lang: t(lang, code) })}
                    // The choice is remembered for the next visit only when functional cookies are accepted
                    onClick$={() => setLang(lang, code, userPreferences.preferences.functional)}>
                    {code.toUpperCase()}
                </FloatingButton>
            ))}
        </div>
    )
})
