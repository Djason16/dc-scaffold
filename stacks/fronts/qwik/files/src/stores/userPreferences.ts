import { createContextId, useContext, useContextProvider, useStore } from '@builder.io/qwik'
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
 * Then in a component:  const userPreferences = useUserPreferences()  and  if (userPreferences.preferences.maps) { ...show the map... }
 * Its actions (stores/actions/):  withActions(userPreferences).acceptAll()
 */
// A new store for each page built (the site is built page by page)
const createState = () => ({
    // true once the visitor clicked a button of the banner
    hasUserMadeChoice: false,

    // Current choice of the visitor
    preferences: {
        essential: true,
        functional: false,
    } as Record<string, boolean>,

    // Categories listed when the visitor clicks "Customize"
    categories: {
        // @two-languages
        essential: { required: true }, // the site needs them (navigation, security)
        functional: { required: false }, // remembers choices such as the language
        // @end-two-languages
        // @one-language
        essential: { required: true, label: '{{TEXT_JS:essentialLabel}}', description: '{{TEXT_JS:essentialDescription}}' },
        functional: { required: false, label: '{{TEXT_JS:functionalLabel}}', description: '{{TEXT_JS:functionalDescription}}' },
        // @end-one-language
    } as Record<string, { required: boolean, label?: string, description?: string }>,
})

export type UserPreferences = ReturnType<typeof createState>
type Actions = typeof userPreferencesActions

const UserPreferencesContext = createContextId<UserPreferences>('userPreferences')

// Store of the whole site (called once, by src/root.tsx)
export const useUserPreferencesProvider = () => {
    useContextProvider(UserPreferencesContext, useStore(createState()))
}

// The store, in any component
export const useUserPreferences = () => useContext(UserPreferencesContext)

// The store with its actions (they change "this" like in Pinia), to call in an event: withActions(userPreferences).denyAll()
export const withActions = (store: UserPreferences): UserPreferences & Actions => {
    const target: UserPreferences & Actions = new Proxy(store, {
        get: (object, key) => (key in userPreferencesActions
            ? (userPreferencesActions as Record<string | symbol, (...args: unknown[]) => unknown>)[key].bind(target)
            : Reflect.get(object, key)),
    }) as UserPreferences & Actions
    return target
}
