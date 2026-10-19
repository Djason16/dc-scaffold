<script>
    import '#lib/assets/css/main.css'
    // DC Scaffold design, while it is on (dc-scaffold.config.js)
    import '#lib/assets/css/design.css'
    import AppShell from '#lib/components/layout/AppShell/AppShell.svelte'

    // Root of the site: every page inside the app shell (src/lib/components/layout/AppShell)
    let { children } = $props()
</script>

<svelte:head>
    <link rel="icon" href="/favicon.ico" />
</svelte:head>

<AppShell>
    {@render children()}
</AppShell>
