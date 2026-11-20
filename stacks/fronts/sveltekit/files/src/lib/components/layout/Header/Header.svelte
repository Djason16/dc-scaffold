<script lang="ts">
    // SvelteKit version of the shared Header: links through resolve() of $app/paths (folder of a qualif included)
    import { resolve } from '$app/paths'
    import { useSite } from '#lib/composables/useSite.js'
    import { lang } from '#lib/plugins/lang.svelte.js'

    const site = useSite()
</script>

<!-- Top of every page: site name (link to the home page) and menu -->
<header class="header">
    <div class="container">
        <a href={resolve('/')} class="header-logo" title={site.name}>{site.name}</a>
        <nav aria-label={lang.getTranslation('home')}>
            <ul class="header-nav">
                <li><a href={resolve('/')} title={lang.getTranslation('home')}>{lang.getTranslation('home')}</a></li>
                <!-- Add a page: <li><a href={resolve('/about/')}>{lang.getTranslation('about')}</a></li> -->
            </ul>
        </nav>
    </div>
</header>
