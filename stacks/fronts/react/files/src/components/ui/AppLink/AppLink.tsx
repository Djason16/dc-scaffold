import { Link, type LinkProps } from 'react-router'

// Link between the pages of the site: the page changes without reloading (React Router)
export default function AppLink({ href, ...props }: Omit<LinkProps, 'to'> & { href: string }) {
    return <Link to={href} {...props} />
}
