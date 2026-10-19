import { api } from './api.js'
import { mountAppShell } from './components/layout/AppShell/appShell.js'
import { useSite } from './composables/useSite.js'
import guards from './middleware/index.js'
import { startApp } from './plugins/app.js'

// @two-languages
// Entry point loaded by every page: frame of the page, then guards, consent, language, texts, <head>, buttons, banner
// @end-two-languages
// @one-language
// Entry point loaded by every page: frame of the page, then guards, consent, <head>, buttons, banner
// @end-one-language

// Design of DC Scaffold (dc-scaffold.config.js): its welcome page and its texts
if (window.DC_SCAFFOLD?.design !== false) await import('./dc-scaffold/index.js')

const site = useSite()
mountAppShell(site)
startApp({ site, guards })

// Checks that the API answers (remove once the site uses it)
const result = await api.get('/')
console.info(result.success ? `API connected: ${result.message}` : `API unreachable: ${result.error}`)
