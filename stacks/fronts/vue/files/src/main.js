import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import lang from './plugins/lang.js'
import router from './router/index.js'
import './assets/css/main.css'
// DC Scaffold design, while it is on (dc-scaffold.config.js)
import './assets/css/design.css'

createApp(App).use(createPinia()).use(lang).use(router).mount('#app')
