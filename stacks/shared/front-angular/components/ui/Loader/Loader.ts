import { Component } from '@angular/core'
import { useLang } from '@/composables/useLang'

// The loading screen of the site (AppShell), on the first opening and on every page change: "Loading" over a thin line
@Component({
    selector: 'app-loader',
    template: `
        <div class="loader" role="status" aria-live="polite">
            <p class="loader-label">{{ lang.getTranslation('loading') }}</p>
            <span class="loader-line" aria-hidden="true"></span>
        </div>
    `,
})
export class Loader {
    protected lang = useLang()
}
