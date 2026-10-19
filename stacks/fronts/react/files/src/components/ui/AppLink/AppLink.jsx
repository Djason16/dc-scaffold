import { Link } from 'react-router'

// Link between the pages of the site: the page changes without reloading (React Router)
export default function AppLink({ href, ...props }) {
    return <Link to={href} {...props} />
}
