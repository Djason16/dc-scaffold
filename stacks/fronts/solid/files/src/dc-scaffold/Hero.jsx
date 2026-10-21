import PageHero from '@/components/ui/PageHero/PageHero.jsx'
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'

// Welcome of DC Scaffold, shown while design is true in dc-scaffold.config.js
export default function Hero() {
    const { getTranslation: t } = useLang()
    const site = useSite()

    const badge = (
        <span class="hero-badge">
            <img src="/dc-scaffold/icon.png" alt="" width="28" height="28" />
            {t('heroBadge')}
        </span>
    )

    return (
        <PageHero eyebrow={badge} title={t('heroTitle', { name: site.name })} text={t('heroText')} large>
            <div class="hero-by">
                {t('heroBy')}
                <a class="hero-by-link" href="https://djason-chery.dev/" target="_blank" rel="noopener">
                    <img src="/dc-scaffold/logo-light.png" alt="Djason CHERY" width="114" height="32" />
                </a>
            </div>
        </PageHero>
    )
}
