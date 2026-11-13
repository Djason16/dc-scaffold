<script lang="ts">
    import { useSite } from '#lib/composables/useSite.js'
    import { lang } from '#lib/plugins/lang.svelte.js'

    const site = useSite()
</script>

<!-- Top of every page: site name (link to the home page) and menu -->
<header class="header">
    <div class="container">
        <a href="/" class="header-logo" title={site.name}>{site.name}</a>
        <nav aria-label={lang.getTranslation('home')}>
            <ul class="header-nav">
                <li><a href="/" title={lang.getTranslation('home')}>{lang.getTranslation('home')}</a></li>
                <!-- Add a page: <li><a href="/about/">{lang.getTranslation('about')}</a></li> -->
            </ul>
        </nav>
    </div>
</header>
