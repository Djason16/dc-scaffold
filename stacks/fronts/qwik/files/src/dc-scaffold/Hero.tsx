import { component$ } from '@builder.io/qwik'
import PageHero from '~/components/ui/PageHero/PageHero'
import { useLang } from '~/composables/useLang'
import { t } from '~/plugins/lang'
import { useSite } from '~/composables/useSite'

// Welcome of DC Scaffold, shown while design is true in dc-scaffold.config.js
export default component$(() => {
    const lang = useLang()
    const site = useSite()

    return (
        <PageHero title={t(lang, 'heroTitle', { name: site.name })} text={t(lang, 'heroText')} large>
            <span q:slot="eyebrow" class="hero-badge">
                {/* eslint-disable-next-line qwik/jsx-img */}
                <img src="/dc-scaffold/icon.png" alt="" width="28" height="28" />
                {t(lang, 'heroBadge')}
            </span>
            <div class="hero-by">
                {t(lang, 'heroBy')}
                <a class="hero-by-link" href="https://djason-chery.dev/" target="_blank" rel="noopener">
                    {/* eslint-disable-next-line qwik/jsx-img */}
                    <img src="/dc-scaffold/logo-light.png" alt="Djason CHERY" width="114" height="32" />
                </a>
            </div>
        </PageHero>
    )
})
