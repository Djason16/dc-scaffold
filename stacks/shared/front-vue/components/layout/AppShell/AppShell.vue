<template>
    <!-- Frame of every page (and of the error page): loader, header, page, footer, floating buttons, cookie banner -->
    <Loader v-if="showLoader" />
    <div v-show="!showLoader" class="app-shell">
        <Header />
        <main>
            <slot />
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
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Footer from '@/components/layout/Footer/Footer.vue'
import Header from '@/components/layout/Header/Header.vue'
import BackToTop from '@/components/ui/Button/BackToTop.vue'
// @two-languages
import ChangeLanguageButton from '@/components/ui/Button/ChangeLanguageButton.vue'
// @end-two-languages
import Loader from '@/components/ui/Loader/Loader.vue'
import PreferencesBanner from '@/components/ui/PreferencesBanner/PreferencesBanner.vue'
import { useLang } from '@/composables/useLang.js'
import { design } from '@/design.js'
import { useUserPreferencesStore } from '@/stores/userPreferences.js'

// Loader with the DC Scaffold design only (dc-scaffold.config.js): true = always, false = never
const LOADER_ENABLED = design
// Minimum time of the loader on a page change, so it does not just flash (milliseconds)
const LOADER_PAGE_TIME = 400

const lang = useLang()
const router = useRouter()
const userPreferences = useUserPreferencesStore()
const showLoader = ref(LOADER_ENABLED)
let ready = false
let shownAt = 0

// Loader again on every page change: shown when the navigation starts, hidden once the new page is there
const removeBefore = router.beforeEach((to, from) => {
    if (LOADER_ENABLED && ready && to.path !== from.path) {
        showLoader.value = true
        shownAt = Date.now()
    }
})
const removeAfter = router.afterEach(() => {
    if (!ready) return
    setTimeout(() => { showLoader.value = false }, Math.max(0, LOADER_PAGE_TIME - (Date.now() - shownAt)))
})
onUnmounted(() => {
    removeBefore()
    removeAfter()
})

onMounted(async () => {
    // Choice saved during a previous visit (cookie)
    userPreferences.loadPreferences()

    // @two-languages
    // Language of a previous visit, only if the visitor accepted functional cookies
    if (userPreferences.preferences.functional) lang.restore()
    // @end-two-languages

    // Fonts of utils/fonts.css loaded: the text will not change size, the loader can go
    await document.fonts.ready
    showLoader.value = false
    ready = true
})
</script>
