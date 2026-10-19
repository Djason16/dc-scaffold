<template>
    <!-- Root of the site: every page inside the app shell (components/layout/AppShell) -->
    <AppShell>
        <RouterView />
    </AppShell>
</template>

<script setup>
import AppShell from '@/components/layout/AppShell/AppShell.vue'
</script>
