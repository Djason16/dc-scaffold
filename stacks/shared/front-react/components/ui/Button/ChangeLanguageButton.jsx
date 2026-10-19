import FloatingButton from '@/components/ui/Button/FloatingButton.jsx'
import { useLang } from '@/composables/useLang.js'
import { useUserPreferencesStore } from '@/stores/userPreferences.js'

// One button per language of plugins/translations/translations.js (nothing when the site has one language)
export default function ChangeLanguageButton() {
    const lang = useLang()
    const functional = useUserPreferencesStore((state) => state.preferences.functional)

    if (lang.availableLanguages.length < 2) return null

    return (
        <div className="language-switcher">
            {lang.availableLanguages.map((code) => (
                <FloatingButton key={code}
                    className={lang.current === code ? 'active' : ''}
                    aria-label={lang.getTranslation('switchToLang', { lang: lang.getTranslation(code) })}
                    // The choice is remembered for the next visit only when functional cookies are accepted
                    onClick={() => lang.setLang(code, functional)}>
                    {code.toUpperCase()}
                </FloatingButton>
            ))}
        </div>
    )
}
