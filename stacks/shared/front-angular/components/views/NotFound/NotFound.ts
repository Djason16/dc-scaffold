import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { PageHero } from '@/components/ui/PageHero/PageHero'
import { useLang } from '@/composables/useLang'
import { useSeo } from '@/composables/useSeo'

// Content of the page shown for an address that does not exist: the same PageHero as the other pages
@Component({
    selector: 'app-not-found',
    imports: [PageHero, RouterLink],
    template: `
        <section class="section">
            <div class="container">
                <app-page-hero [eyebrow]="lang.getTranslation('notFoundEyebrow')" [title]="lang.getTranslation('notFoundTitle')"
                    [text]="lang.getTranslation('notFoundText')">
                    <a routerLink="/" class="btn btn-primary">{{ lang.getTranslation('backHome') }}</a>
                </app-page-hero>
            </div>
        </section>
    `,
})
export class NotFound {
    protected lang = useLang()

    constructor() {
        useSeo('notFound')
    }
}
