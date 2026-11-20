<script lang="ts">
    import { useSite } from '#lib/composables/useSite.js'
    import { lang } from '#lib/plugins/lang.svelte.js'
    import { buildSeo } from '#lib/utils/seo.js'

    // @two-languages
    // <head> of a page from SEO_PAGES (utils/seo.ts), prerendered, updated on language change
    // @end-two-languages
    // @one-language
    // <head> of a page from SEO_PAGES (utils/seo.ts), prerendered
    // @end-one-language
    let { pageKey }: { pageKey: string } = $props()
    const site = useSite()
    const seo = $derived(buildSeo({ pageKey, t: lang.getTranslation, locale: lang.current, site }))

    // "<" escaped so the JSON can never close the <script> tag
    const jsonLd = $derived(seo.jsonLd
        ? `<script type="application/ld+json">${JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c')}<` + '/script>'
        : '')
</script>

<svelte:head>
    <title>{seo.title}</title>
    {#each seo.meta as tag ('name' in tag ? tag.name : tag.property)}
        {#if 'property' in tag}
            <meta property={tag.property} content={tag.content} />
        {:else}
            <meta name={tag.name} content={tag.content} />
        {/if}
    {/each}
    {#each seo.link as link (link.rel)}
        <link rel={link.rel} href={link.href} />
    {/each}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- the JSON-LD of utils/seo.ts, "<" escaped above: no outside HTML -->
    {@html jsonLd}
</svelte:head>
