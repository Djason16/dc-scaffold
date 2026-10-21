import { component$ } from '@builder.io/qwik'
import { QwikCityProvider, RouterOutlet } from '@builder.io/qwik-city'
import Seo from '~/components/ui/Seo/Seo'
// @two-languages
import { useLangProvider } from '~/plugins/lang'
// @end-two-languages
import { useUserPreferencesProvider } from '~/stores/userPreferences'
import './assets/css/main.css'
// DC Scaffold design, while it is on (dc-scaffold.config.js)
import './assets/css/design.css'

// Root of the site: <head> of the page (components/ui/Seo), then each page of src/routes inside src/routes/layout.tsx
export default component$(() => {
    // @two-languages
    // Current language, for every component
    useLangProvider()
    // @end-two-languages
    // Cookie choice of the visitor, for every component
    useUserPreferencesProvider()

    return (
        <QwikCityProvider>
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                <Seo />
            </head>
            <body>
                <RouterOutlet />
            </body>
        </QwikCityProvider>
    )
})
