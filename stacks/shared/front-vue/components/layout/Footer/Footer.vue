<template>
    <!-- Bottom of every page: copyright and cookie settings -->
    <footer class="footer">
        <div class="container">
            <p>© {{ year }} {{ site.name }}. {{ t('allRightsReserved') }}</p>
            <!-- Opens the cookie banner again, on the current choice -->
            <button type="button" class="footer-link" @click="userPreferences.openSettings()">{{ t('prefsSettings') }}</button>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { useLang } from '@/composables/useLang'
import { useSite } from '@/composables/useSite'
import { useUserPreferencesStore } from '@/stores/userPreferences'

const { getTranslation: t } = useLang()
const site = useSite()
const userPreferences = useUserPreferencesStore()
const year = new Date().getFullYear()
</script>
