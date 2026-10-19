<template>
    <!-- Full screen shown while the page gets ready (AppShell) -->
    <div class="loader" role="status" :aria-label="t('loading')">
        <span class="loader-spinner" />
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
</script>
