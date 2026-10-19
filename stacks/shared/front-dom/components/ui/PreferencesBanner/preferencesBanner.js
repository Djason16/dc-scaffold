import { lang } from '../../../plugins/lang.js'
import { userPreferences } from '../../../stores/userPreferences.js'
import { h } from '../../../utils/dom.js'

// Cookie banner inside <div data-preferences-banner>, shown until the visitor chooses
// (texts in plugins/translations/common/preferences.js)
export const mountPreferencesBanner = (container) => {
    const t = (key) => lang.getTranslation(key)
    const choices = { ...userPreferences.preferences }
    let customizing = false

    // One checkbox per category of stores/userPreferences.js
    const categories = () => h('div', { class: 'preferences-banner-categories' },
        Object.entries(userPreferences.categories).map(([name, category]) => h('label', {},
            h('input', {
                type: 'checkbox',
                checked: choices[name],
                disabled: category.required,
                onchange: (event) => { choices[name] = event.target.checked },
            }),
            // @two-languages
            h('span', {}, t(`${name}Label`), h('small', {}, t(`${name}Description`))),
            // @end-two-languages
            // @one-language
            h('span', {}, category.label, h('small', {}, category.description)),
            // @end-one-language
        )))

    const render = () => {
        if (userPreferences.hasUserMadeChoice) return container.replaceChildren()
        container.replaceChildren(h('div', { class: 'preferences-banner', role: 'dialog', 'aria-label': t('prefsTitle') },
            h('h2', {}, t('prefsTitle')),
            h('p', {}, t('prefsText')),
            customizing ? categories() : null,
            h('div', { class: 'preferences-banner-actions' },
                h('button', { type: 'button', class: 'btn', onclick: () => userPreferences.denyAll() }, t('prefsDenyAll')),
                customizing
                    ? h('button', { type: 'button', class: 'btn', onclick: () => userPreferences.savePreferences(choices) }, t('prefsSave'))
                    : h('button', { type: 'button', class: 'btn', onclick: () => { customizing = true; render() } }, t('prefsCustomize')),
                h('button', { type: 'button', class: 'btn btn-primary', onclick: () => userPreferences.acceptAll() }, t('prefsAcceptAll')),
            ),
        ))
    }

    userPreferences.subscribe(render)
    // @two-languages
    // Drawn again in the new language
    lang.onChange(render)
    // @end-two-languages
}
