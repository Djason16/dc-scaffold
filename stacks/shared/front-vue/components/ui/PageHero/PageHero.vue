<template>
    <!--
        Top of a page: small title, large title, text and buttons (assets/css/components/page-hero.css, decorated by the DC Scaffold design while it is on).
        <PageHero :eyebrow="t('aboutEyebrow')" :title="t('aboutTitle')" :text="t('aboutText')">
            <RouterLink to="/contact/" class="btn btn-primary">{{ t('contact') }}</RouterLink>
        </PageHero>
    -->
    <div class="page-hero" :class="{ 'page-hero-large': large }">
        <slot name="eyebrow">
            <p v-if="eyebrow" class="page-hero-eyebrow">{{ eyebrow }}</p>
        </slot>
        <h1>{{ title }}</h1>
        <p v-if="text" class="page-hero-text">{{ text }}</p>
        <div v-if="$slots.default" class="page-hero-actions">
            <slot />
        </div>
    </div>
</template>

<script setup>
defineProps({
    eyebrow: { type: String, default: '' },
    title: { type: String, required: true },
    text: { type: String, default: '' },
    // true = taller, for the home page
    large: { type: Boolean, default: false },
})
</script>
