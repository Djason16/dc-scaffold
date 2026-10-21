import { For, Show } from 'solid-js'
import FloatingButton from '@/components/ui/Button/FloatingButton.jsx'
import { useLang } from '@/composables/useLang.js'
import { userPreferences } from '@/stores/userPreferences.js'

// One button per language of plugins/translations/translations.js (nothing when the site has one language)
export default function ChangeLanguageButton() {
    const lang = useLang()

    return (
        <Show when={lang.availableLanguages.length > 1}>
            <div class="language-switcher">
                <For each={lang.availableLanguages}>
                    {(code) => (
                        <FloatingButton
                            class={lang.current === code ? 'active' : ''}
                            aria-label={lang.getTranslation('switchToLang', { lang: lang.getTranslation(code) })}
                            // The choice is remembered for the next visit only when functional cookies are accepted
                            onClick={() => lang.setLang(code, userPreferences.preferences.functional)}>
                            {code.toUpperCase()}
                        </FloatingButton>
                    )}
                </For>
            </div>
        </Show>
    )
}
