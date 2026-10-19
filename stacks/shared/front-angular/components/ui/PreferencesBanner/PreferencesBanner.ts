import { Component, inject, signal } from '@angular/core'
import { useLang } from '@/composables/useLang'
import { UserPreferencesStore } from '@/stores/userPreferences'

// Cookie banner, shown until the visitor chooses (texts in plugins/translations/common/preferences.js)
@Component({
    selector: 'app-preferences-banner',
    template: `
        @if (!userPreferences.hasUserMadeChoice()) {
            <div class="preferences-banner" role="dialog" [attr.aria-label]="lang.getTranslation('prefsTitle')">
                <h2>{{ lang.getTranslation('prefsTitle') }}</h2>
                <p>{{ lang.getTranslation('prefsText') }}</p>

                <!-- One checkbox per category of stores/userPreferences.ts -->
                @if (customizing()) {
                    <div class="preferences-banner-categories">
                        @for (name of categoryNames; track name) {
                            <label>
                                <input type="checkbox" [checked]="choices()[name]" [disabled]="userPreferences.categories[name].required"
                                    (change)="choose(name, $any($event.target).checked)">
                                <!-- @two-languages -->
                                <span>{{ lang.getTranslation(name + 'Label') }}<small>{{ lang.getTranslation(name + 'Description') }}</small></span>
                                <!-- @end-two-languages -->
                                <!-- @one-language -->
                                <span>{{ userPreferences.categories[name].label }}<small>{{ userPreferences.categories[name].description }}</small></span>
                                <!-- @end-one-language -->
                            </label>
                        }
                    </div>
                }

                <div class="preferences-banner-actions">
                    <button type="button" class="btn" (click)="userPreferences.denyAll()">{{ lang.getTranslation('prefsDenyAll') }}</button>
                    @if (customizing()) {
                        <button type="button" class="btn" (click)="userPreferences.savePreferences(choices())">{{ lang.getTranslation('prefsSave') }}</button>
                    } @else {
                        <button type="button" class="btn" (click)="customizing.set(true)">{{ lang.getTranslation('prefsCustomize') }}</button>
                    }
                    <button type="button" class="btn btn-primary" (click)="userPreferences.acceptAll()">{{ lang.getTranslation('prefsAcceptAll') }}</button>
                </div>
            </div>
        }
    `,
})
export class PreferencesBanner {
    protected lang = useLang()
    protected userPreferences = inject(UserPreferencesStore)
    protected categoryNames = Object.keys(this.userPreferences.categories)
    protected customizing = signal(false)
    protected choices = signal<Record<string, boolean>>({ ...this.userPreferences.preferences() })

    choose(name: string, checked: boolean) {
        this.choices.update((choices) => ({ ...choices, [name]: checked }))
    }
}
