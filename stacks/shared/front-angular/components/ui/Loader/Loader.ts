import { Component } from '@angular/core'
import { useLang } from '@/composables/useLang'

// Full screen shown while the page gets ready (AppShell)
@Component({
    selector: 'app-loader',
    template: `
        <div class="loader" role="status" [attr.aria-label]="lang.getTranslation('loading')">
            <span class="loader-spinner"></span>
        </div>
    `,
})
export class Loader {
    protected lang = useLang()
}
