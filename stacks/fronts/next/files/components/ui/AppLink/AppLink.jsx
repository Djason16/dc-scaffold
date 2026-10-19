import Link from 'next/link'

// Link between the pages of the site: the page changes without reloading (next/link)
export default function AppLink({ href, ...props }) {
    return <Link href={href} {...props} />
}
