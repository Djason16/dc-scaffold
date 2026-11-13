import AppLink from '@/components/ui/AppLink/AppLink'
import { useLang } from '@/composables/useLang'
import { useSite } from '@/composables/useSite'

// Top of every page: site name (link to the home page) and menu
export default function Header() {
    const { getTranslation: t } = useLang()
    const site = useSite()

    return (
        <header class="header">
            <div class="container">
                <AppLink href="/" class="header-logo" title={site.name}>{site.name}</AppLink>
                <nav aria-label={t('home')}>
                    <ul class="header-nav">
                        <li><AppLink href="/" title={t('home')}>{t('home')}</AppLink></li>
                        {/* Add a page: <li><AppLink href="/about/">{t('about')}</AppLink></li> */}
                    </ul>
                </nav>
            </div>
        </header>
    )
}
