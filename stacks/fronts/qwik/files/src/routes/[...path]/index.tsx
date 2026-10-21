import { component$ } from '@builder.io/qwik'
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city'
import NotFound from '~/components/views/NotFound/NotFound'

// Any address without a page while the site runs (npm run dev): the same 404 page as 404.tsx, with the 404 status
export const onGet: RequestHandler = ({ status }) => {
    status(404)
}

export default component$(() => <NotFound />)

export const head: DocumentHead = { frontmatter: { pageKey: 'notFound' } }
