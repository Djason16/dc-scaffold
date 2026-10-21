import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import SectionLayout from '~/components/ui/SectionLayout/SectionLayout'
import Intro from '~/components/views/Index/Intro'
import { welcome } from '~/design.js'

// Ordered list of the home page sections (components/views/Index).
// While design is true in dc-scaffold.config.js, the welcome page of DC Scaffold is shown instead.
const sections = welcome ?? [Intro]

// Home page: sections rendered in order by SectionLayout
export default component$(() => <SectionLayout sections={sections} />)

// Title, description, Open Graph... of the page (utils/seo.js)
export const head: DocumentHead = { frontmatter: { pageKey: 'index' } }
