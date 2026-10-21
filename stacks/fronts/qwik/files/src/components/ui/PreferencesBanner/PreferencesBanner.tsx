import { component$, useSignal, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik'
import { useLang } from '~/composables/useLang'
import { t } from '~/plugins/lang'
import { useUserPreferences, withActions } from '~/stores/userPreferences'

// Cookie banner, shown until the visitor chooses (texts in plugins/translations/common/preferences.js)
export default component$(() => {
    const lang = useLang()
    const userPreferences = useUserPreferences()
    const customizing = useSignal(false)
    const choices = useStore({ ...userPreferences.preferences })

    // Opened again from "Cookie settings": the boxes show the current choice
    const wasHidden = useSignal(false)
    useTask$(({ track }) => {
        const made = track(() => userPreferences.hasUserMadeChoice)
        if (made) {
            wasHidden.value = true
        } else if (wasHidden.value) {
            Object.assign(choices, userPreferences.preferences)
            customizing.value = true
        }
    })

    // Only shown in the browser: the cookie with the choice is not known while the page is built
    const mounted = useSignal(false)
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
        mounted.value = true
    }, { strategy: 'document-ready' })

    if (!mounted.value || userPreferences.hasUserMadeChoice) return <span hidden />

    return (
        <div class="preferences-banner" role="dialog" aria-label={t(lang, 'prefsTitle')}>
            <h2>{t(lang, 'prefsTitle')}</h2>
            <p>{t(lang, 'prefsText')}</p>

            {/* One checkbox per category of stores/userPreferences.ts */}
            {customizing.value && (
                <div class="preferences-banner-categories">
                    {Object.entries(userPreferences.categories).map(([name, category]) => (
                        <label key={name}>
                            <input type="checkbox" checked={choices[name]} disabled={category.required}
                                onChange$={(event, input) => (choices[name] = input.checked)} />
                            {/* @two-languages */}
                            <span>{t(lang, `${name}Label`)}<small>{t(lang, `${name}Description`)}</small></span>
                            {/* @end-two-languages */}
                            {/* @one-language */}
                            <span>{category.label}<small>{category.description}</small></span>
                            {/* @end-one-language */}
                        </label>
                    ))}
                </div>
            )}

            <div class="preferences-banner-actions">
                <button type="button" class="btn" onClick$={() => withActions(userPreferences).denyAll()}>{t(lang, 'prefsDenyAll')}</button>
                {customizing.value
                    ? <button type="button" class="btn" onClick$={() => withActions(userPreferences).savePreferences({ ...choices })}>{t(lang, 'prefsSave')}</button>
                    : <button type="button" class="btn" onClick$={() => (customizing.value = true)}>{t(lang, 'prefsCustomize')}</button>}
                <button type="button" class="btn btn-primary" onClick$={() => withActions(userPreferences).acceptAll()}>{t(lang, 'prefsAcceptAll')}</button>
            </div>
        </div>
    )
})
