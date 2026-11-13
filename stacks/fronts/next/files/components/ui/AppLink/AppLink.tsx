import Link from 'next/link'
import type { ComponentProps } from 'react'

// Link between the pages of the site: the page changes without reloading (next/link)
export default function AppLink({ href, ...props }: ComponentProps<typeof Link>) {
    return <Link href={href} {...props} />
}
