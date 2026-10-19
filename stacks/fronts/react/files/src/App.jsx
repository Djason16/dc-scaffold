import { Outlet } from 'react-router'
import AppShell from '@/components/layout/AppShell/AppShell.jsx'

// Root of the site: the page of the current URL (<Outlet />) inside the app shell (components/layout/AppShell)
export default function App() {
    return (
        <AppShell>
            <Outlet />
        </AppShell>
    )
}
