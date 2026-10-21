import { component$, Slot, useVisibleTask$ } from '@builder.io/qwik'
import { useLocation, useNavigate } from '@builder.io/qwik-city'
import AppShell from '~/components/layout/AppShell/AppShell'
import guards from '~/middleware'

// Frame of every page of src/routes: the AppShell (components/layout/AppShell)
export default component$(() => {
    const location = useLocation()
    const navigate = useNavigate()

    // Route guards of src/middleware before every page, in order (in the browser: the site is static)
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
        const url = track(() => location.url)
        for (const guard of guards) {
            const target = guard(new URL(url))
            if (target) {
                navigate(target, { replaceState: true })
                return
            }
        }
    }, { strategy: 'document-ready' })

    return (
        <AppShell>
            <Slot />
        </AppShell>
    )
})
