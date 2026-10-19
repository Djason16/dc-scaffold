import AppShell from '@/components/layout/AppShell/AppShell.jsx'
import { LangProvider } from '@/plugins/lang.jsx'
import '@/assets/css/main.css'
// DC Scaffold design, while it is on (dc-scaffold.config.js)
import '@/assets/css/design.css'

// @two-languages
// Root of the site (Pages Router): languages, global CSS, every page inside the app shell (components/layout/AppShell)
// @end-two-languages
// @one-language
// Root of the site (Pages Router): global CSS, every page inside the app shell (components/layout/AppShell)
// @end-one-language
export default function App({ Component, pageProps }) {
    return (
        <LangProvider>
            <AppShell>
                <Component {...pageProps} />
            </AppShell>
        </LangProvider>
    )
}
