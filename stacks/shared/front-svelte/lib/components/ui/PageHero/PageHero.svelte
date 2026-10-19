<script>
    /*
     * Top of a page: small title, large title, text and buttons (assets/css/components/page-hero.css, decorated by the DC Scaffold design while it is on).
     *   <PageHero eyebrow={t('aboutEyebrow')} title={t('aboutTitle')} text={t('aboutText')}>
     *       <a href="/contact/" class="btn btn-primary">{t('contact')}</a>
     *   </PageHero>
     * badge: a snippet shown instead of the eyebrow text (the home page). large: taller, for the home page.
     */

    /** @type {{ eyebrow?: string, title: string, text?: string, large?: boolean, badge?: import('svelte').Snippet, children?: import('svelte').Snippet }} */
    let { eyebrow = '', title, text = '', large = false, badge, children } = $props()
</script>

<div class="page-hero" class:page-hero-large={large}>
    {#if badge}
        {@render badge()}
    {:else if eyebrow}
        <p class="page-hero-eyebrow">{eyebrow}</p>
    {/if}
    <h1>{title}</h1>
    {#if text}
        <p class="page-hero-text">{text}</p>
    {/if}
    {#if children}
        <div class="page-hero-actions">
            {@render children()}
        </div>
    {/if}
</div>
