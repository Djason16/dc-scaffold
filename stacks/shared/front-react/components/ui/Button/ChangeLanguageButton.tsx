import FloatingButton from '@/components/ui/Button/FloatingButton'
import { useLang } from '@/composables/useLang'
import { useUserPreferencesStore } from '@/stores/userPreferences'

// One button per language of plugins/translations/translations.ts (nothing when the site has one language)
export default function ChangeLanguageButton() {
    const lang = useLang()
    const functional = useUserPreferencesStore((state) => state.preferences.functional)

    if (lang.availableLanguages.length < 2) return null

    return (
        <div className="language-switcher">
            {lang.availableLanguages.map((code) => (
                <FloatingButton key={code}
                    className={lang.current === code ? 'active' : ''}
                    aria-label={`${code.toUpperCase()}, ${lang.getTranslation('switchToLang', { lang: lang.getTranslation(code) })}`}
                    // The choice is remembered for the next visit only when functional cookies are accepted
                    onClick={() => lang.setLang(code, functional)}>
                    {code.toUpperCase()}
                </FloatingButton>
            ))}
        </div>
    )
}
