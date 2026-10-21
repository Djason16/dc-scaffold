<script>
    import AppShell from '#lib/components/layout/AppShell/AppShell.svelte'
    import { router } from '#lib/router.svelte.js'

    // Page of the current address (src/lib/router.svelte.js)
    const Page = $derived(router.page)
</script>

<!-- Root of the site: every page inside the app shell (src/lib/components/layout/AppShell) -->
<AppShell>
    <Page params={router.params} />
</AppShell>
