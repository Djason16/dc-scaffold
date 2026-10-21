/* @refresh reload */
import { Router } from '@solidjs/router'
import { render } from 'solid-js/web'
import App from './App.jsx'
import { LangProvider } from './plugins/lang.jsx'
import { routes } from './routes.js'
import './assets/css/main.css'
// DC Scaffold design, while it is on (dc-scaffold.config.js)
import './assets/css/design.css'

render(() => (
    <LangProvider>
        <Router root={App}>{routes}</Router>
    </LangProvider>
), document.getElementById('root'))
