<template>
    <!-- Top of every page: site name (link to the home page) and menu -->
    <header class="header">
        <div class="container">
            <RouterLink to="/" class="header-logo">{{ site.name }}</RouterLink>
            <nav :aria-label="t('home')">
                <ul class="header-nav">
                    <li><RouterLink to="/">{{ t('home') }}</RouterLink></li>
                    <!-- Add a page: <li><RouterLink to="/about/">{{ t('about') }}</RouterLink></li> -->
                </ul>
            </nav>
        </div>
    </header>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'

const { getTranslation: t } = useLang()
const site = useSite()
</script>
