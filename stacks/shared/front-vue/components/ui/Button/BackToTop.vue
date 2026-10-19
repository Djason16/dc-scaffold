<template>
    <!-- Shown once the visitor scrolled down, brings them back to the top -->
    <FloatingButton v-if="visible" :aria-label="t('backToTop')" :title="t('backToTop')" @click="scrollToTop">↑</FloatingButton>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import FloatingButton from '@/components/ui/Button/FloatingButton.vue'
import { useLang } from '@/composables/useLang.js'

// Scroll distance (in pixels) after which the button shows
const SHOW_AFTER = 400

const { getTranslation: t } = useLang()
const visible = ref(false)

const onScroll = () => { visible.value = window.scrollY > SHOW_AFTER }
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>
