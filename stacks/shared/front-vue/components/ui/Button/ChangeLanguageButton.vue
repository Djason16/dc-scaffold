<template>
    <!-- One button per language of plugins/translations/translations.ts (nothing when the site has one language) -->
    <div v-if="lang.availableLanguages.length > 1" class="language-switcher">
        <FloatingButton v-for="code in lang.availableLanguages" :key="code"
            :class="{ active: lang.current.value === code }"
            :aria-label="`${code.toUpperCase()}, ${lang.getTranslation('switchToLang', { lang: lang.getTranslation(code) })}`"
            @click="switchLanguage(code)">
            {{ code.toUpperCase() }}
        </FloatingButton>
    </div>
</template>

<script setup lang="ts">
import FloatingButton from '@/components/ui/Button/FloatingButton.vue'
import { useLang } from '@/composables/useLang'
import { useUserPreferencesStore } from '@/stores/userPreferences'

const lang = useLang()
const userPreferences = useUserPreferencesStore()

// The choice is remembered for the next visit only when functional cookies are accepted
const switchLanguage = (code: string) => lang.setLang(code, userPreferences.preferences.functional)
</script>
