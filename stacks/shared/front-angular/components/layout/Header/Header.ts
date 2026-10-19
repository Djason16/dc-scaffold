import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { useLang } from '@/composables/useLang'
import { useSite } from '@/composables/useSite'

// Top of every page: site name (link to the home page) and menu
@Component({
    selector: 'header[app-header]',
    host: { class: 'header' },
    imports: [RouterLink],
    template: `
        <div class="container">
            <a routerLink="/" class="header-logo">{{ site.name }}</a>
            <nav [attr.aria-label]="lang.getTranslation('home')">
                <ul class="header-nav">
                    <li><a routerLink="/">{{ lang.getTranslation('home') }}</a></li>
                    <!-- Add a page: <li><a routerLink="/about">{{ lang.getTranslation('about') }}</a></li> -->
                </ul>
            </nav>
        </div>
    `,
})
export class Header {
    protected lang = useLang()
    protected site = useSite()
}
