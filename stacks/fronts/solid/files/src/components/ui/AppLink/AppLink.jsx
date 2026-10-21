import { A } from '@solidjs/router'

// Link between the pages of the site: the page changes without reloading (Solid Router)
export default function AppLink(props) {
    return <A {...props} />
}
