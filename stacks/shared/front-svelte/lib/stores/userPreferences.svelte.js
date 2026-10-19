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
 * Then anywhere:  if (userPreferences.preferences.maps) { ...show the map... }
 */
export const userPreferences = $state({
    // true once the visitor clicked a button of the banner
    hasUserMadeChoice: false,

    // Current choice of the visitor
    preferences: {
        essential: true,
        functional: false,
    },

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
    },

    // loadPreferences, savePreferences, acceptAll, denyAll... (stores/actions/)
    ...userPreferencesActions,
})
