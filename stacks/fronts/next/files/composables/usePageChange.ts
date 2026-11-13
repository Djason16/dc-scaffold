import { useRouter } from 'next/router'
import { useEffect } from 'react'

/**
 * Page changes of Next.js (Pages Router), for the loader of the AppShell.
 * @param start Called when a navigation to another page begins
 * @param end Called once the new page is shown (or the navigation failed)
 */
export function usePageChange(start: () => void, end: () => void) {
    const router = useRouter()

    useEffect(() => {
        const onStart = (url: string, { shallow }: { shallow: boolean }) => {
            if (!shallow) start()
        }
        router.events.on('routeChangeStart', onStart)
        router.events.on('routeChangeComplete', end)
        router.events.on('routeChangeError', end)
        return () => {
            router.events.off('routeChangeStart', onStart)
            router.events.off('routeChangeComplete', end)
            router.events.off('routeChangeError', end)
        }
    }, [router, start, end])
}
