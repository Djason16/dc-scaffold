import { component$ } from '@builder.io/qwik'
import AppLink from '~/components/ui/AppLink/AppLink'
import { useLang } from '~/composables/useLang'
import { t } from '~/plugins/lang'
import { useSite } from '~/composables/useSite'

// Top of every page: site name (link to the home page) and menu
export default component$(() => {
    const lang = useLang()
    const site = useSite()

    return (
        <header class="header">
            <div class="container">
                <AppLink href="/" class="header-logo">{site.name}</AppLink>
                <nav aria-label={t(lang, 'home')}>
                    <ul class="header-nav">
                        <li><AppLink href="/">{t(lang, 'home')}</AppLink></li>
                        {/* Add a page: <li><AppLink href="/about/">{t(lang, 'about')}</AppLink></li> */}
                    </ul>
                </nav>
            </div>
        </header>
    )
})
