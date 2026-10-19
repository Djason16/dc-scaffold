import { h } from '../../../utils/dom.js'
import { footer } from '../Footer/footer.js'
import { header } from '../Header/header.js'

/*
 * Frame of every page, like the AppShell component of the other fronts:
 * @two-languages
 * header, page (<main>), footer, floating buttons (back to top, languages), cookie banner.
 * @end-two-languages
 * @one-language
 * header, page (<main>), footer, floating button (back to top), cookie banner.
 * @end-one-language
 * A page only contains its <main> (and the loader): see pages/index.html.
 */
export const mountAppShell = (site) => {
    const main = document.querySelector('main')
    const shell = h('div', { class: 'app-shell' })
    main.replaceWith(shell)

    shell.append(
        header(site),
        main,
        footer(site),
        // Buttons floating at the bottom right
        h('div', { class: 'floating-controls' },
            h('div', { 'data-back-to-top': true }),
            // @two-languages
            h('div', { 'data-language-switcher': true }),
            // @end-two-languages
        ),
        h('div', { 'data-preferences-banner': true }),
    )
}
