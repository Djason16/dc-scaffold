import Seo from '@/components/ui/Seo/Seo.jsx'
import SectionLayout from '@/components/ui/SectionLayout/SectionLayout.jsx'
import Intro from '@/components/views/Index/Intro.jsx'
import { welcome } from '@/design.js'

// Ordered list of the home page sections (components/views/Index).
// While design is true in dc-scaffold.config.js, the welcome page of DC Scaffold is shown instead.
const sections = welcome ?? [Intro]

export default function Index() {
    return (
        <>
            {/* @two-languages */}
            {/* Title, description, Open Graph... updated when the language changes (utils/seo.js) */}
            {/* @end-two-languages */}
            {/* @one-language */}
            {/* Title, description, Open Graph... of the page (utils/seo.js) */}
            {/* @end-one-language */}
            <Seo pageKey="index" />
            <SectionLayout sections={sections} />
        </>
    )
}
