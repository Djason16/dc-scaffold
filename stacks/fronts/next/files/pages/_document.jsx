import { Head, Html, Main, NextScript } from 'next/document'
// @two-languages
import { LANGUAGES } from '@/plugins/translations/translations.js'
// @end-two-languages

// @two-languages
// HTML of every exported page; the language attribute follows the switcher in the browser
// @end-two-languages
// @one-language
// HTML of every exported page, in the language of the site
// @end-one-language
export default function Document() {
    return (
        // @two-languages
        <Html lang={LANGUAGES[0]}>
        // @end-two-languages
        // @one-language
        <Html lang="{{DEFAULT_LANG}}">
        // @end-one-language
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
