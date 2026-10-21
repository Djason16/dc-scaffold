<script>
    import { onMount } from 'svelte'
    import { lang } from '#lib/plugins/lang.svelte.js'
    import { userPreferences } from '#lib/stores/userPreferences.svelte.js'

    const t = (/** @type {string} */ key) => lang.getTranslation(key)
    let customizing = $state(false)
    /** @type {Record<string, boolean>} */
    let choices = $state({ ...userPreferences.preferences })

    // Opened again from "Cookie settings": the boxes show the current choice
    let wasHidden = false
    $effect(() => {
        if (userPreferences.hasUserMadeChoice) {
            wasHidden = true
        } else if (wasHidden) {
            choices = { ...userPreferences.preferences }
            customizing = true
        }
    })

    // Only shown in the browser: the cookie with the choice is not known while the page is built
    let mounted = $state(false)
    onMount(() => { mounted = true })
</script>

<!-- Cookie banner, shown until the visitor chooses (texts in plugins/translations/common/preferences.js) -->
{#if mounted && !userPreferences.hasUserMadeChoice}
    <div class="preferences-banner" role="dialog" aria-label={t('prefsTitle')}>
        <h2>{t('prefsTitle')}</h2>
        <p>{t('prefsText')}</p>

        <!-- One checkbox per category of stores/userPreferences.svelte.js -->
        {#if customizing}
            <div class="preferences-banner-categories">
                {#each Object.entries(userPreferences.categories) as [name, category] (name)}
                    <label>
                        <input type="checkbox" bind:checked={choices[name]} disabled={category.required} />
                        <!-- @two-languages -->
                        <span>{t(`${name}Label`)}<small>{t(`${name}Description`)}</small></span>
                        <!-- @end-two-languages -->
                        <!-- @one-language -->
                        <span>{category.label}<small>{category.description}</small></span>
                        <!-- @end-one-language -->
                    </label>
                {/each}
            </div>
        {/if}

        <div class="preferences-banner-actions">
            <button type="button" class="btn" onclick={() => userPreferences.denyAll()}>{t('prefsDenyAll')}</button>
            {#if customizing}
                <button type="button" class="btn" onclick={() => userPreferences.savePreferences(choices)}>{t('prefsSave')}</button>
            {:else}
                <button type="button" class="btn" onclick={() => (customizing = true)}>{t('prefsCustomize')}</button>
            {/if}
            <button type="button" class="btn btn-primary" onclick={() => userPreferences.acceptAll()}>{t('prefsAcceptAll')}</button>
        </div>
    </div>
{/if}
