<template>
    <!-- First section of the home page: replace it with your content, add the next ones in pages/index.vue -->
    <PageHero :title="t('introTitle', { name: site.name })" large />
</template>

<script setup>
import PageHero from '@/components/ui/PageHero/PageHero.vue'
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'

const { getTranslation: t } = useLang()
const site = useSite()
</script>
