import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter, withInMemoryScrolling } from '@angular/router'
import { routes } from './app.routes'

// Services of the whole site: the routes, and back to the top of the page on every page change
export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    ],
}
