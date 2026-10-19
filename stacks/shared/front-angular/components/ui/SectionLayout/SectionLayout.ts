import { NgComponentOutlet } from '@angular/common'
import { Component, input, Type } from '@angular/core'

// Each component of "sections" in its own <section>, in order
@Component({
    selector: 'app-section-layout',
    imports: [NgComponentOutlet],
    template: `
        @for (section of sections(); track $index) {
            <section class="section">
                <div class="container">
                    <ng-container *ngComponentOutlet="section" />
                </div>
            </section>
        }
    `,
})
export class SectionLayout {
    readonly sections = input<Type<unknown>[]>([])
}
