import { component$, Slot } from '@builder.io/qwik'
import { Link, type LinkProps } from '@builder.io/qwik-city'

// Link between the pages of the site: the page changes without reloading (Qwik City)
export default component$((props: LinkProps) => (
    <Link {...props}>
        <Slot />
    </Link>
))
