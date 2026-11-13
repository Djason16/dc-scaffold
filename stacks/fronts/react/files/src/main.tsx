import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { LangProvider } from './plugins/lang'
import { router } from './router'
import './assets/css/main.css'
// DC Scaffold design, while it is on (dc-scaffold.config.js)
import './assets/css/design.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <LangProvider>
            <RouterProvider router={router} />
        </LangProvider>
    </StrictMode>,
)
