import { A, type AnchorProps } from '@solidjs/router'

// Link between the pages of the site: the page changes without reloading (Solid Router)
export default function AppLink(props: Omit<AnchorProps, 'href'> & { href: string }) {
    return <A {...props} />
}
