import { h } from '../../../utils/dom.js'

// Top of every page: site name (link to the home page) and menu
export const header = (site) => h('header', { class: 'header' },
    h('div', { class: 'container' },
        h('a', { href: '/', class: 'header-logo' }, site.name),
        h('nav', { 'data-i18n-attr': 'aria-label:home' },
            h('ul', { class: 'header-nav' },
                h('li', {}, h('a', { href: '/', 'data-i18n': 'home' })),
                // Add a page: h('li', {}, h('a', { href: '/about', 'data-i18n': 'about' })),
            ),
        ),
    ),
)
