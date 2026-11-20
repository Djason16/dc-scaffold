import { useState, useSyncExternalStore } from 'react'
import { useLang } from '@/composables/useLang'
import { useUserPreferencesStore } from '@/stores/userPreferences'

// Nothing to subscribe to: only the server/client difference matters for useSyncExternalStore
const subscribeNever = () => () => {}

// Cookie banner, shown until the visitor chooses (texts in plugins/translations/common/preferences.js)
export default function PreferencesBanner() {
    const { getTranslation: t } = useLang()
    const userPreferences = useUserPreferencesStore()
    const [customizing, setCustomizing] = useState(false)
    const [choices, setChoices] = useState(userPreferences.preferences)

    // Opened again from "Cookie settings": the boxes show the current choice.
    // State adjusted during render (not in an effect) to avoid a second render pass:
    // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
    const [hadChoice, setHadChoice] = useState(userPreferences.hasUserMadeChoice)
    if (hadChoice !== userPreferences.hasUserMadeChoice) {
        setHadChoice(userPreferences.hasUserMadeChoice)
        if (!userPreferences.hasUserMadeChoice) {
            setChoices({ ...userPreferences.preferences })
            setCustomizing(true)
        }
    }

    // Only shown in the browser: the cookie with the choice is not known while the page is built
    // (false on the server and during hydration, true afterwards, without a setState in an effect)
    const mounted = useSyncExternalStore(subscribeNever, () => true, () => false)

    if (!mounted || userPreferences.hasUserMadeChoice) return null

    return (
        <div className="preferences-banner" role="dialog" aria-label={t('prefsTitle')}>
            <h2>{t('prefsTitle')}</h2>
            <p>{t('prefsText')}</p>

            {/* One checkbox per category of stores/userPreferences.ts */}
            {customizing && (
                <div className="preferences-banner-categories">
                    {Object.entries(userPreferences.categories).map(([name, category]) => (
                        <label key={name}>
                            <input type="checkbox" checked={choices[name]} disabled={category.required}
                                onChange={(event) => setChoices({ ...choices, [name]: event.target.checked })} />
                            {/* @two-languages */}
                            <span>{t(`${name}Label`)}<small>{t(`${name}Description`)}</small></span>
                            {/* @end-two-languages */}
                            {/* @one-language */}
                            <span>{category.label}<small>{category.description}</small></span>
                            {/* @end-one-language */}
                        </label>
                    ))}
                </div>
            )}

            <div className="preferences-banner-actions">
                <button type="button" className="btn" onClick={() => userPreferences.denyAll()}>{t('prefsDenyAll')}</button>
                {customizing
                    ? <button type="button" className="btn" onClick={() => userPreferences.savePreferences(choices)}>{t('prefsSave')}</button>
                    : <button type="button" className="btn" onClick={() => setCustomizing(true)}>{t('prefsCustomize')}</button>}
                <button type="button" className="btn btn-primary" onClick={() => userPreferences.acceptAll()}>{t('prefsAcceptAll')}</button>
            </div>
        </div>
    )
}
