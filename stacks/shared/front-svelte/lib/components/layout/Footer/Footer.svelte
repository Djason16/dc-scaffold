<script>
    import { useSite } from '#lib/composables/useSite.js'
    import { lang } from '#lib/plugins/lang.svelte.js'
    import { userPreferences } from '#lib/stores/userPreferences.svelte.js'

    const site = useSite()
    const year = new Date().getFullYear()
</script>

<!-- Bottom of every page: copyright and cookie settings -->
<footer class="footer">
    <div class="container">
        <p>© {year} {site.name}. {lang.getTranslation('allRightsReserved')}</p>
        <!-- Opens the cookie banner again, on the current choice -->
        <button type="button" class="footer-link" onclick={() => userPreferences.openSettings()}>{lang.getTranslation('prefsSettings')}</button>
    </div>
</footer>
