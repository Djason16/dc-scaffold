import { Component, inject } from '@angular/core'
import { FloatingButton } from '@/components/ui/Button/FloatingButton'
import { useLang } from '@/composables/useLang'
import { UserPreferencesStore } from '@/stores/userPreferences'

// One button per language of plugins/translations/translations.js (nothing when the site has one language)
@Component({
    selector: 'app-change-language-button',
    imports: [FloatingButton],
    template: `
        @if (lang.availableLanguages.length > 1) {
            <div class="language-switcher">
                @for (code of lang.availableLanguages; track code) {
                    <button appFloatingButton [class.active]="lang.current() === code"
                        [attr.aria-label]="lang.getTranslation('switchToLang', { lang: lang.getTranslation(code) })"
                        (click)="switchLanguage(code)">{{ code.toUpperCase() }}</button>
                }
            </div>
        }
    `,
})
export class ChangeLanguageButton {
    protected lang = useLang()
    private userPreferences = inject(UserPreferencesStore)

    // The choice is remembered for the next visit only when functional cookies are accepted
    switchLanguage(code: string) {
        this.lang.setLang(code, this.userPreferences.preferences().functional)
    }
}
