<script>
    import { onMount } from 'svelte'
    import { afterNavigate, beforeNavigate } from '$app/navigation'
    import Footer from '#lib/components/layout/Footer/Footer.svelte'
    import Header from '#lib/components/layout/Header/Header.svelte'
    import BackToTop from '#lib/components/ui/Button/BackToTop.svelte'
    // @two-languages
    import ChangeLanguageButton from '#lib/components/ui/Button/ChangeLanguageButton.svelte'
    // @end-two-languages
    import Loader from '#lib/components/ui/Loader/Loader.svelte'
    import PreferencesBanner from '#lib/components/ui/PreferencesBanner/PreferencesBanner.svelte'
    import { lang } from '#lib/plugins/lang.svelte.js'
    import { design } from '#lib/design.js'
    import { userPreferences } from '#lib/stores/userPreferences.svelte.js'

    // Loader with the DC Scaffold design only (dc-scaffold.config.js): true = always, false = never
    const LOADER_ENABLED = design
    // Minimum time of the loader on a page change, so it does not just flash (milliseconds)
    const LOADER_PAGE_TIME = 400

    let { children } = $props()
    let showLoader = $state(LOADER_ENABLED)
    let ready = false
    let shownAt = 0

    // Loader again on every page change: shown when the navigation starts, hidden once the new page is there
    beforeNavigate(({ from, to, willUnload }) => {
        if (LOADER_ENABLED && ready && !willUnload && to && from?.url.pathname !== to.url.pathname) {
            showLoader = true
            shownAt = Date.now()
        }
    })
    afterNavigate(() => {
        if (!ready) return
        setTimeout(() => (showLoader = false), Math.max(0, LOADER_PAGE_TIME - (Date.now() - shownAt)))
    })

    onMount(async () => {
        // Choice saved during a previous visit (cookie)
        userPreferences.loadPreferences()

        // @two-languages
        // Language of a previous visit, only if the visitor accepted functional cookies
        if (userPreferences.preferences.functional) lang.restore()
        // @end-two-languages

        // Fonts of utils/fonts.css loaded: the text will not change size, the loader can go
        await document.fonts.ready
        showLoader = false
        ready = true
    })
</script>

<!-- Frame of every page (and of the error page): loader, header, page, footer, floating buttons, cookie banner -->
{#if showLoader}
    <Loader />
{/if}
<div class="app-shell" style:display={showLoader ? 'none' : null}>
    <Header />
    <main>
        {@render children()}
    </main>
    <Footer />

    <!-- Buttons floating at the bottom right -->
    <div class="floating-controls">
        <BackToTop />
        <!-- @two-languages -->
        <ChangeLanguageButton />
        <!-- @end-two-languages -->
    </div>

    <PreferencesBanner />
</div>
