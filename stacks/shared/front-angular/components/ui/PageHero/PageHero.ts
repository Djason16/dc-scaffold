import { Component, input } from '@angular/core'

/*
 * Top of a page: small title, large title, text and buttons (assets/css/components/page-hero.css, decorated by the DC Scaffold design while it is on).
 *   <app-page-hero [eyebrow]="lang.getTranslation('aboutEyebrow')" [title]="lang.getTranslation('aboutTitle')" [text]="lang.getTranslation('aboutText')">
 *       <a routerLink="/contact" class="btn btn-primary">{{ lang.getTranslation('contact') }}</a>
 *   </app-page-hero>
 * eyebrow: a text, or any element with the pageHeroEyebrow attribute (the badge of the home page).
 * large: taller, for the home page. routerLink: links between the pages, without reloading.
 */
@Component({
    selector: 'app-page-hero',
    template: `
        <div class="page-hero" [class.page-hero-large]="large()">
            @if (eyebrow()) {
                <p class="page-hero-eyebrow">{{ eyebrow() }}</p>
            }
            <ng-content select="[pageHeroEyebrow]" />
            <h1>{{ title() }}</h1>
            @if (text()) {
                <p class="page-hero-text">{{ text() }}</p>
            }
            <div class="page-hero-actions"><ng-content /></div>
        </div>
    `,
})
export class PageHero {
    readonly eyebrow = input('')
    readonly title = input('')
    readonly text = input('')
    readonly large = input(false)
}
