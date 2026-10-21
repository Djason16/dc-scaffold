import { createEffect, createSignal, For, on, Show } from 'solid-js'
import { useLang } from '@/composables/useLang.js'
import { userPreferences } from '@/stores/userPreferences.js'

// Cookie banner, shown until the visitor chooses (texts in plugins/translations/common/preferences.js)
export default function PreferencesBanner() {
    const { getTranslation: t } = useLang()
    const [customizing, setCustomizing] = createSignal(false)
    const [choices, setChoices] = createSignal({ ...userPreferences.preferences })

    // Opened again from "Cookie settings": the boxes show the current choice
    createEffect(on(() => userPreferences.hasUserMadeChoice, (made) => {
        if (made) return
        setChoices({ ...userPreferences.preferences })
        setCustomizing(true)
    }, { defer: true }))

    return (
        <Show when={!userPreferences.hasUserMadeChoice}>
            <div class="preferences-banner" role="dialog" aria-label={t('prefsTitle')}>
                <h2>{t('prefsTitle')}</h2>
                <p>{t('prefsText')}</p>

                {/* One checkbox per category of stores/userPreferences.js */}
                <Show when={customizing()}>
                    <div class="preferences-banner-categories">
                        <For each={Object.entries(userPreferences.categories)}>
                            {([name, category]) => (
                                <label>
                                    <input type="checkbox" checked={choices()[name]} disabled={category.required}
                                        onChange={(event) => setChoices({ ...choices(), [name]: event.currentTarget.checked })} />
                                    {/* @two-languages */}
                                    <span>{t(`${name}Label`)}<small>{t(`${name}Description`)}</small></span>
                                    {/* @end-two-languages */}
                                    {/* @one-language */}
                                    <span>{category.label}<small>{category.description}</small></span>
                                    {/* @end-one-language */}
                                </label>
                            )}
                        </For>
                    </div>
                </Show>

                <div class="preferences-banner-actions">
                    <button type="button" class="btn" onClick={() => userPreferences.denyAll()}>{t('prefsDenyAll')}</button>
                    <Show when={customizing()}
                        fallback={<button type="button" class="btn" onClick={() => setCustomizing(true)}>{t('prefsCustomize')}</button>}>
                        <button type="button" class="btn" onClick={() => userPreferences.savePreferences(choices())}>{t('prefsSave')}</button>
                    </Show>
                    <button type="button" class="btn btn-primary" onClick={() => userPreferences.acceptAll()}>{t('prefsAcceptAll')}</button>
                </div>
            </div>
        </Show>
    )
}
