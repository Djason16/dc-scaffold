<template>
    <!-- Home page: sections rendered in order by SectionLayout -->
    <SectionLayout :sections="sections" />
</template>

<script setup>
import SectionLayout from '@/components/ui/SectionLayout/SectionLayout.vue'
import Intro from '@/components/views/Index/Intro.vue'
import { useSeo } from '@/composables/useSeo.js'
import { welcome } from '@/design.js'

// Ordered list of the home page sections (components/views/Index).
// While design is true in dc-scaffold.config.js, the welcome page of DC Scaffold is shown instead.
const sections = welcome ?? [Intro]

// @two-languages
// Title, description, Open Graph... updated when the language changes (utils/seo.js)
// @end-two-languages
// @one-language
// Title, description, Open Graph... of the page (utils/seo.js)
// @end-one-language
useSeo('index')
</script>
