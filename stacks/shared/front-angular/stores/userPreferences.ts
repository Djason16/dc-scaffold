import { Injectable, signal } from '@angular/core'
import { userPreferencesActions } from './actions/userPreferencesActions.js'

/*
 * Cookie preferences of the visitor (the cookie banner).
 *
 * Add a category, for example "maps" for an interactive map:
 *   1. add  maps: false  to "preferences" (off until the visitor accepts it)
 * @two-languages
 *   2. add  maps: { required: false }  to "categories" (required: true = always on, cannot be refused)
 *   3. write its texts in plugins/translations/common/preferences.js: mapsLabel and mapsDescription
 * @end-two-languages
 * @one-language
 *   2. add  maps: { required: false, label: 'Map', description: 'Shows an interactive map' }  to "categories"
 *      (required: true = always on, cannot be refused; label and description: texts of the banner)
 * @end-one-language
 * Then anywhere:  if (userPreferences.preferences()['maps']) { ...show the map... }
 */
type Preferences = { essential: boolean, functional: boolean, [category: string]: boolean }
type ActionName = keyof typeof userPreferencesActions

@Injectable({ providedIn: 'root' })
export class UserPreferencesStore {
    // true once the visitor clicked a button of the banner
    readonly hasUserMadeChoice = signal(false)

    // Current choice of the visitor
    readonly preferences = signal<Preferences>({
        essential: true,
        functional: false,
    })

    // Categories listed when the visitor clicks "Customize"
    readonly categories: Record<string, { required: boolean, label?: string, description?: string }> = {
        // @two-languages
        essential: { required: true }, // the site needs them (navigation, security)
        functional: { required: false }, // remembers choices such as the language
        // @end-two-languages
        // @one-language
        essential: { required: true, label: '{{TEXT_JS:essentialLabel}}', description: '{{TEXT_JS:essentialDescription}}' },
        functional: { required: false, label: '{{TEXT_JS:functionalLabel}}', description: '{{TEXT_JS:functionalDescription}}' },
        // @end-one-language
    }

    readonly loadPreferences = () => this.run('loadPreferences')
    readonly savePreferences = (chosen?: Record<string, boolean>) => this.run('savePreferences', chosen)
    readonly acceptAll = () => this.run('acceptAll')
    readonly denyAll = () => this.run('denyAll')
    readonly resetPreferences = () => this.run('resetPreferences')
    readonly deleteCookie = () => this.run('deleteCookie')

    // The actions (stores/actions/) change "this" like in Pinia: they work on a copy of the state,
    // then the signals take the result and the components are refreshed
    private run(name: ActionName, ...args: unknown[]) {
        const draft = {
            hasUserMadeChoice: this.hasUserMadeChoice(),
            preferences: { ...this.preferences() },
            categories: this.categories,
            ...userPreferencesActions,
        }
        const result = (draft[name] as (...values: unknown[]) => unknown).apply(draft, args)
        this.preferences.set(draft.preferences as Preferences)
        this.hasUserMadeChoice.set(draft.hasUserMadeChoice)
        return result
    }
}
