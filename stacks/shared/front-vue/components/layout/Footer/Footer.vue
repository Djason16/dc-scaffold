<template>
    <!-- Bottom of every page: copyright and cookie settings -->
    <footer class="footer">
        <div class="container">
            <p>© {{ year }} {{ site.name }}. {{ t('allRightsReserved') }}</p>
            <!-- Forgets the choice: the cookie banner shows again -->
            <button type="button" class="footer-link" @click="userPreferences.deleteCookie()">{{ t('prefsSettings') }}</button>
        </div>
    </footer>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'
import { useUserPreferencesStore } from '@/stores/userPreferences.js'

const { getTranslation: t } = useLang()
const site = useSite()
const userPreferences = useUserPreferencesStore()
const year = new Date().getFullYear()
</script>
