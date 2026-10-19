import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

/**
 * Page changes of React Router, for the loader of the AppShell.
 * @param {() => void} start Called when the page changes
 * @param {() => void} end Called right after (the AppShell keeps the loader a moment)
 */
export function usePageChange(start, end) {
    const { pathname } = useLocation()
    const first = useRef(true)

    useEffect(() => {
        // Not on the first page: the AppShell already shows the loader while it starts
        if (first.current) {
            first.current = false
            return
        }
        start()
        end()
    }, [pathname, start, end])
}
