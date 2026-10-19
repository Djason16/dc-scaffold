<script>
    import PageHero from '#lib/components/ui/PageHero/PageHero.svelte'
    import { useSite } from '#lib/composables/useSite.js'
    import { lang } from '#lib/plugins/lang.svelte.js'

    const site = useSite()
</script>

<!-- First section of the home page: replace it with your content, add the next ones in src/routes/+page.svelte -->
<PageHero title={lang.getTranslation('introTitle', { name: site.name })} large />
