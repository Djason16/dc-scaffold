<script>
    import FloatingButton from '#lib/components/ui/Button/FloatingButton.svelte'
    import { lang } from '#lib/plugins/lang.svelte.js'

    // Scroll distance (in pixels) after which the button shows
    const SHOW_AFTER = 400

    let scrollY = $state(0)
</script>

<svelte:window bind:scrollY />

<!-- Shown once the visitor scrolled down, brings them back to the top -->
{#if scrollY > SHOW_AFTER}
    <FloatingButton aria-label={lang.getTranslation('backToTop')} title={lang.getTranslation('backToTop')}
        onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</FloatingButton>
{/if}
