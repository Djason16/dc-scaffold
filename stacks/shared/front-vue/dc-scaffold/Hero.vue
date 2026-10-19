<template>
    <!-- Welcome of DC Scaffold, shown while design is true in dc-scaffold.config.js -->
    <PageHero :title="t('heroTitle', { name: site.name })" :text="t('heroText')" large>
        <template #eyebrow>
            <span class="hero-badge">
                <img src="/dc-scaffold/icon.png" alt="" width="28" height="28">
                {{ t('heroBadge') }}
            </span>
        </template>
        <div class="hero-by">
            {{ t('heroBy') }}
            <a class="hero-by-link" href="https://djason-chery.dev/" target="_blank" rel="noopener">
                <img src="/dc-scaffold/logo-light.png" alt="Djason CHERY" width="114" height="32">
            </a>
        </div>
    </PageHero>
</template>

<script setup>
import PageHero from '@/components/ui/PageHero/PageHero.vue'
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'

const { getTranslation: t } = useLang()
const site = useSite()
</script>
