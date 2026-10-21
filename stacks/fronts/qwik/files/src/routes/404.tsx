import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import NotFound from '~/components/views/NotFound/NotFound'

// Page of the static site for an address without a page (404.html): inside the app shell like every page
export default component$(() => <NotFound />)

export const head: DocumentHead = { frontmatter: { pageKey: 'notFound' } }
