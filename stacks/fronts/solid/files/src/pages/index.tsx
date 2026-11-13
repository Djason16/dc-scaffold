import Seo from '@/components/ui/Seo/Seo'
import SectionLayout from '@/components/ui/SectionLayout/SectionLayout'
import Intro from '@/components/views/Index/Intro'
import { welcome } from '@/design'

// Ordered list of the home page sections (components/views/Index).
// While design is true in dc-scaffold.config.js, the welcome page of DC Scaffold is shown instead.
const sections = welcome ?? [Intro]

export default function Index() {
    return (
        <>
            {/* @two-languages */}
            {/* Title, description, Open Graph... updated when the language changes (utils/seo.ts) */}
            {/* @end-two-languages */}
            {/* @one-language */}
            {/* Title, description, Open Graph... of the page (utils/seo.ts) */}
            {/* @end-one-language */}
            <Seo pageKey="index" />
            <SectionLayout sections={sections} />
        </>
    )
}
