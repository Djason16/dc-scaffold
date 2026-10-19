import { Component, HostListener, signal } from '@angular/core'
import { FloatingButton } from '@/components/ui/Button/FloatingButton'
import { useLang } from '@/composables/useLang'

// Scroll distance (in pixels) after which the button shows
const SHOW_AFTER = 400

// Shown once the visitor scrolled down, brings them back to the top
@Component({
    selector: 'app-back-to-top',
    imports: [FloatingButton],
    template: `
        @if (visible()) {
            <button appFloatingButton [attr.aria-label]="lang.getTranslation('backToTop')" [title]="lang.getTranslation('backToTop')"
                (click)="toTop()">↑</button>
        }
    `,
})
export class BackToTop {
    protected lang = useLang()
    protected visible = signal(false)

    @HostListener('window:scroll')
    onScroll() {
        this.visible.set(window.scrollY > SHOW_AFTER)
    }

    toTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}
