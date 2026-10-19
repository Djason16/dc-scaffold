<script>
    import { lang } from '#lib/plugins/lang.svelte.js'
</script>

<!-- Full screen shown while the page gets ready (AppShell) -->
<div class="loader" role="status" aria-label={lang.getTranslation('loading')}>
    <span class="loader-spinner"></span>
</div>
