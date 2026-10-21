import { Component, inject } from '@angular/core'
import { useLang } from '@/composables/useLang'
import { useSite } from '@/composables/useSite'
import { UserPreferencesStore } from '@/stores/userPreferences'

// Bottom of every page: copyright and cookie settings
@Component({
    selector: 'footer[app-footer]',
    host: { class: 'footer' },
    template: `
        <div class="container">
            <p>© {{ year }} {{ site.name }}. {{ lang.getTranslation('allRightsReserved') }}</p>
            <!-- Opens the cookie banner again, on the current choice -->
            <button type="button" class="footer-link" (click)="userPreferences.openSettings()">{{ lang.getTranslation('prefsSettings') }}</button>
        </div>
    `,
})
export class Footer {
    protected lang = useLang()
    protected site = useSite()
    protected userPreferences = inject(UserPreferencesStore)
    protected year = new Date().getFullYear()
}
