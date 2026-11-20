<script setup lang="ts">
// Any other address: the 404 page (error.vue), as an error of Nuxt (no "No match found" warning of Vue Router)
throw createError({ statusCode: 404, statusMessage: 'Page not found' })
</script>

<template>
    <div />
</template>