<template>
    <!-- Each component of "sections" in its own <section>, in order -->
    <section v-for="(section, index) in sections" :key="index" class="section">
        <div class="container">
            <component :is="section" />
        </div>
    </section>
</template>

<script setup>
defineProps({
    sections: { type: Array, required: true },
})
</script>
