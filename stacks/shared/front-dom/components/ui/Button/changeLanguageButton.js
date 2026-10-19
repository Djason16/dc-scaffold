import { lang } from '../../../plugins/lang.js'
import { userPreferences } from '../../../stores/userPreferences.js'
import { floatingButton } from './floatingButton.js'

// One button per language inside <div data-language-switcher> (nothing when the site has one language)
export const mountChangeLanguageButton = (container) => {
    if (lang.availableLanguages.length < 2) return
    container.classList.add('language-switcher')

    const render = () => container.replaceChildren(...lang.availableLanguages.map((code) => floatingButton({
        label: code.toUpperCase(),
        active: lang.current === code,
        ariaLabel: lang.getTranslation('switchToLang', { lang: lang.getTranslation(code) }),
        // The choice is remembered for the next visit only when functional cookies are accepted
        onClick: () => lang.setLang(code, userPreferences.preferences.functional),
    })))

    render()
    lang.onChange(render)
}
