<template>
    <!-- The loading screen of the site (AppShell), on the first opening and on every page change: "Loading" over a thin line -->
    <div class="loader" role="status" aria-live="polite">
        <p class="loader-label">{{ t('loading') }}</p>
        <span class="loader-line" aria-hidden="true" />
    </div>
</template>

<script setup lang="ts">
import { useLang } from '@/composables/useLang'

// Multi-word name (style guide of Vue), also shown in the Vue devtools
defineOptions({ name: 'PageLoader' })

const { getTranslation: t } = useLang()
</script>
