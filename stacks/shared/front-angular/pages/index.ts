import { Component } from '@angular/core'
import { SectionLayout } from '@/components/ui/SectionLayout/SectionLayout'
import { Intro } from '@/components/views/Index/Intro'
import { useSeo } from '@/composables/useSeo'
import { welcome } from '@/design.js'

// Home page: its sections, in order (components/views/Index).
// While design is true in dc-scaffold.config.js, the welcome page of DC Scaffold is shown instead.
@Component({
    selector: 'app-index-page',
    imports: [SectionLayout],
    template: `<app-section-layout [sections]="sections" />`,
})
export class IndexPage {
    protected sections = welcome ?? [Intro]

    constructor() {
        // @two-languages
        // Title, description, Open Graph... updated when the language changes (utils/seo.js)
        // @end-two-languages
        // @one-language
        // Title, description, Open Graph... of the page (utils/seo.js)
        // @end-one-language
        useSeo('index')
    }
}
