import { useLocation, useNavigate } from '@solidjs/router'
import { createEffect } from 'solid-js'
import AppShell from '@/components/layout/AppShell/AppShell.jsx'
import middleware from '@/middleware/index.js'

// Root of the site: the page of the current address inside the AppShell (components/layout/AppShell)
export default function App(props) {
    const location = useLocation()
    const navigate = useNavigate()

    // Route guards of src/middleware before every page, in order
    createEffect(() => {
        const url = new URL(location.pathname + location.search, window.location.origin)
        for (const guard of middleware) {
            const target = guard(url)
            if (target) return navigate(target, { replace: true })
        }
    })

    return <AppShell>{props.children}</AppShell>
}
