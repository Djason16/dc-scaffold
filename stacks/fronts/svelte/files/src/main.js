import { mount } from 'svelte'
import App from './App.svelte'
import './lib/assets/css/main.css'
// DC Scaffold design, while it is on (dc-scaffold.config.js)
import './lib/assets/css/design.css'

mount(App, { target: /** @type {HTMLElement} */ (document.getElementById('app')) })
