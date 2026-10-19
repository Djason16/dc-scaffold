import { Component } from '@angular/core'
import { PageHero } from '@/components/ui/PageHero/PageHero'
import { useLang } from '@/composables/useLang'
import { useSite } from '@/composables/useSite'

// First section of the home page: replace it with your content, add the next ones in pages/index.ts
@Component({
    selector: 'app-intro',
    imports: [PageHero],
    template: `<app-page-hero [title]="lang.getTranslation('introTitle', { name: site.name })" [large]="true" />`,
})
export class Intro {
    protected lang = useLang()
    protected site = useSite()
}
