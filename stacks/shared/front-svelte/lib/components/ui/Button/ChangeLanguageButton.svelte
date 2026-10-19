<script>
    import FloatingButton from '#lib/components/ui/Button/FloatingButton.svelte'
    import { lang } from '#lib/plugins/lang.svelte.js'
    import { userPreferences } from '#lib/stores/userPreferences.svelte.js'

    // The choice is remembered for the next visit only when functional cookies are accepted
    const switchLanguage = (/** @type {string} */ code) => lang.setLang(code, userPreferences.preferences.functional)
</script>

<!-- One button per language of plugins/translations/translations.js (nothing when the site has one language) -->
{#if lang.availableLanguages.length > 1}
    <div class="language-switcher">
        {#each lang.availableLanguages as code (code)}
            <FloatingButton
                class={lang.current === code ? 'active' : ''}
                aria-label={lang.getTranslation('switchToLang', { lang: lang.getTranslation(code) })}
                onclick={() => switchLanguage(code)}>
                {code.toUpperCase()}
            </FloatingButton>
        {/each}
    </div>
{/if}
