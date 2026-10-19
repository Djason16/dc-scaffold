import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { AppShell } from '@/components/layout/AppShell/AppShell'

// Root of the site: the page of the current URL (<router-outlet />) inside the app shell (components/layout/AppShell)
@Component({
    selector: 'app-root',
    imports: [AppShell, RouterOutlet],
    template: `
        <app-shell>
            <router-outlet />
        </app-shell>
    `,
})
export class App {}
