import { Component, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router'
import { Footer } from '@/components/layout/Footer/Footer'
import { Header } from '@/components/layout/Header/Header'
import { BackToTop } from '@/components/ui/Button/BackToTop'
// @two-languages
import { ChangeLanguageButton } from '@/components/ui/Button/ChangeLanguageButton'
// @end-two-languages
import { Loader } from '@/components/ui/Loader/Loader'
import { PreferencesBanner } from '@/components/ui/PreferencesBanner/PreferencesBanner'
// @two-languages
import { useLang } from '@/composables/useLang'
// @end-two-languages
import { design } from '@/design.js'
import { UserPreferencesStore } from '@/stores/userPreferences'

// Loader with the DC Scaffold design only (dc-scaffold.config.js): true = always, false = never
const LOADER_ENABLED: boolean = design
// Minimum time of the loader on a page change, so it does not just flash (milliseconds)
const LOADER_PAGE_TIME = 400

// Frame of every page (and of the 404 page): loader, header, page, footer, floating buttons, cookie banner
@Component({
    selector: 'app-shell',
    // @two-languages
    imports: [Header, Footer, BackToTop, ChangeLanguageButton, Loader, PreferencesBanner],
    // @end-two-languages
    // @one-language
    imports: [Header, Footer, BackToTop, Loader, PreferencesBanner],
    // @end-one-language
    template: `
        @if (showLoader()) {
            <app-loader />
        }
        <div class="app-shell" [style.display]="showLoader() ? 'none' : null">
            <header app-header></header>
            <main><ng-content /></main>
            <footer app-footer></footer>

            <!-- Buttons floating at the bottom right -->
            <div class="floating-controls">
                <app-back-to-top />
                <!-- @two-languages -->
                <app-change-language-button />
                <!-- @end-two-languages -->
            </div>

            <app-preferences-banner />
        </div>
    `,
})
export class AppShell {
    protected showLoader = signal(LOADER_ENABLED)
    private ready = false
    private shownAt = 0

    constructor() {
        const userPreferences = inject(UserPreferencesStore)

        // Choice saved during a previous visit (cookie)
        userPreferences.loadPreferences()

        // @two-languages
        // Language of a previous visit, only if the visitor accepted functional cookies
        if (userPreferences.preferences().functional) useLang().restore()
        // @end-two-languages

        // Fonts of utils/fonts.css loaded: the text will not change size, the loader can go
        document.fonts.ready.then(() => {
            this.ready = true
            this.showLoader.set(false)
        })

        // Loader again on every page change: shown when the navigation starts, hidden once the new page is there
        inject(Router).events.pipe(takeUntilDestroyed()).subscribe((event) => {
            if (event instanceof NavigationStart) this.startLoader()
            if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) this.endLoader()
        })
    }

    private startLoader() {
        if (!LOADER_ENABLED || !this.ready) return
        this.shownAt = Date.now()
        this.showLoader.set(true)
    }

    private endLoader() {
        if (!this.ready) return
        setTimeout(() => this.showLoader.set(false), Math.max(0, LOADER_PAGE_TIME - (Date.now() - this.shownAt)))
    }
}
