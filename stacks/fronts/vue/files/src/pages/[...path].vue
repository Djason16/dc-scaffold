<template>
    <!-- Any address without a page: shown inside the app shell like every page -->
    <NotFound />
</template>

<script setup lang="ts">
import NotFound from '@/components/views/NotFound/NotFound.vue'

// Multi-word name (style guide of Vue), also shown in the Vue devtools
defineOptions({ name: 'NotFoundPage' })

</script>
