/* @refresh reload */
import { Router } from '@solidjs/router'
import { render } from 'solid-js/web'
import App from './App.jsx'
import { LangProvider } from './plugins/lang.jsx'
import { routes } from './routes.js'
import './assets/css/main.css'
// DC Scaffold design, while it is on (dc-scaffold.config.js)
import './assets/css/design.css'

// Base of the site (vite.config.js): "" at the root of its address, "/my-site" in a qualif
render(() => (
    <LangProvider>
        <Router root={App} base={import.meta.env.BASE_URL.replace(/\/$/, '')}>{routes}</Router>
    </LangProvider>
), document.getElementById('root'))
