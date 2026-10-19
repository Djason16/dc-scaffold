import { Routes } from '@angular/router'
import { NotFound } from '@/components/views/NotFound/NotFound'
import middleware from '@/middleware/index'
import { IndexPage } from '@/pages/index'

/*
 * Pages of the site: one line per page (its file is in src/app/pages/).
 *   Add a page:  { path: 'about', component: AboutPage },  with  import { AboutPage } from '@/pages/about'
 * The guards of src/app/middleware run before every page, in order.
 */
export const routes: Routes = [
    {
        path: '',
        canActivateChild: middleware,
        children: [
            { path: '', component: IndexPage },
            // Any address without a page: shown inside the app shell like every page
            { path: '**', component: NotFound },
        ],
    },
]
