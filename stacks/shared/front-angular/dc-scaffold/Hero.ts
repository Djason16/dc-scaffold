import { Component } from '@angular/core'
import { PageHero } from '@/components/ui/PageHero/PageHero'
import { useLang } from '@/composables/useLang'
import { useSite } from '@/composables/useSite'

// Welcome of DC Scaffold, shown while design is true in dc-scaffold.config.js
@Component({
    selector: 'app-hero',
    imports: [PageHero],
    template: `
        <app-page-hero [title]="lang.getTranslation('heroTitle', { name: site.name })" [text]="lang.getTranslation('heroText')" [large]="true">
            <span class="hero-badge" pageHeroEyebrow>
                <img src="/dc-scaffold/icon.png" alt="" width="28" height="28">
                {{ lang.getTranslation('heroBadge') }}
            </span>
            <div class="hero-by">
                {{ lang.getTranslation('heroBy') }}
                <a class="hero-by-link" href="https://djason-chery.dev/" target="_blank" rel="noopener">
                    <img src="/dc-scaffold/logo-light.png" alt="Djason CHERY" width="114" height="32">
                </a>
            </div>
        </app-page-hero>
    `,
})
export class Hero {
    protected lang = useLang()
    protected site = useSite()
}
