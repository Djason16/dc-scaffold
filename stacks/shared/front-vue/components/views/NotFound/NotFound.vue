<template>
    <!-- Content of the page shown for an address that does not exist: the same PageHero as the other pages -->
    <section class="section">
        <div class="container">
            <PageHero :eyebrow="t('notFoundEyebrow')" :title="t('notFoundTitle')" :text="t('notFoundText')">
                <RouterLink to="/" class="btn btn-primary">{{ t('backHome') }}</RouterLink>
            </PageHero>
        </div>
    </section>
</template>

<script setup>
import PageHero from '@/components/ui/PageHero/PageHero.vue'
import { useLang } from '@/composables/useLang.js'
import { useSeo } from '@/composables/useSeo.js'

const { getTranslation: t } = useLang()
useSeo('notFound')
</script>
