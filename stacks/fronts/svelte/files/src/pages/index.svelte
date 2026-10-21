<script>
    import SectionLayout from '#lib/components/ui/SectionLayout/SectionLayout.svelte'
    import Seo from '#lib/components/ui/Seo/Seo.svelte'
    import Intro from '#lib/components/views/Index/Intro.svelte'
    import { welcome } from '#lib/design.js'

    // Ordered list of the home page sections (src/lib/components/views/Index).
    // While design is true in dc-scaffold.config.js, the welcome page of DC Scaffold is shown instead.
    const sections = welcome ?? [Intro]
</script>

<!-- @two-languages -->
<!-- Title, description, Open Graph... updated when the language changes (utils/seo.js) -->
<!-- @end-two-languages -->
<!-- @one-language -->
<!-- Title, description, Open Graph... of the page (utils/seo.js) -->
<!-- @end-one-language -->
<Seo pageKey="index" />

<!-- Home page: sections rendered in order by SectionLayout -->
<SectionLayout {sections} />
