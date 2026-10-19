<script>
    import PageHero from '#lib/components/ui/PageHero/PageHero.svelte'
    import { useSite } from '#lib/composables/useSite.js'
    import { lang } from '#lib/plugins/lang.svelte.js'

    const site = useSite()
</script>

<!-- Welcome of DC Scaffold, shown while design is true in dc-scaffold.config.js -->
<PageHero title={lang.getTranslation('heroTitle', { name: site.name })} text={lang.getTranslation('heroText')} large>
    {#snippet badge()}
        <span class="hero-badge">
            <img src="/dc-scaffold/icon.png" alt="" width="28" height="28" />
            {lang.getTranslation('heroBadge')}
        </span>
    {/snippet}
    <div class="hero-by">
        {lang.getTranslation('heroBy')}
        <a class="hero-by-link" href="https://djason-chery.dev/" target="_blank" rel="noopener">
            <img src="/dc-scaffold/logo-light.png" alt="Djason CHERY" width="114" height="32" />
        </a>
    </div>
</PageHero>
