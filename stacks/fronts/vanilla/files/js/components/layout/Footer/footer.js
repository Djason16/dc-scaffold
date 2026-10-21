import { h } from '../../../utils/dom.js'

// Bottom of every page: copyright and cookie settings
export const footer = (site) => h('footer', { class: 'footer' },
    h('div', { class: 'container' },
        h('p', {}, `© ${new Date().getFullYear()} ${site.name}. `, h('span', { 'data-i18n': 'allRightsReserved' })),
        // Opens the cookie banner again, on the current choice (plugins/app.js)
        h('button', { type: 'button', class: 'footer-link', 'data-preferences-settings': true, 'data-i18n': 'prefsSettings' }),
    ),
)
