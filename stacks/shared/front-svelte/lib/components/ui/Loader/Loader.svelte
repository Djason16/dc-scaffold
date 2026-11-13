<script lang="ts">
    import { lang } from '#lib/plugins/lang.svelte.js'
</script>

<!-- The loading screen of the site (AppShell), on the first opening and on every page change: "Loading" over a thin line -->
<div class="loader" role="status" aria-live="polite">
    <p class="loader-label">{lang.getTranslation('loading')}</p>
    <span class="loader-line" aria-hidden="true"></span>
</div>
