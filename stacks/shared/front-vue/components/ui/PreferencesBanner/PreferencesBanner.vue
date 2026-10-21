<template>
    <!-- Cookie banner, shown until the visitor chooses (texts in plugins/translations/common/preferences.js) -->
    <div v-if="mounted && !userPreferences.hasUserMadeChoice" class="preferences-banner" role="dialog"
        :aria-label="t('prefsTitle')">
        <h2>{{ t('prefsTitle') }}</h2>
        <p>{{ t('prefsText') }}</p>

        <!-- One checkbox per category of stores/userPreferences.js -->
        <div v-if="customizing" class="preferences-banner-categories">
            <label v-for="(category, name) in userPreferences.categories" :key="name">
                <input v-model="choices[name]" type="checkbox" :disabled="category.required">
                <!-- @two-languages -->
                <span>{{ t(`${name}Label`) }}<small>{{ t(`${name}Description`) }}</small></span>
                <!-- @end-two-languages -->
                <!-- @one-language -->
                <span>{{ category.label }}<small>{{ category.description }}</small></span>
                <!-- @end-one-language -->
            </label>
        </div>

        <div class="preferences-banner-actions">
            <button type="button" class="btn" @click="userPreferences.denyAll()">{{ t('prefsDenyAll') }}</button>
            <button v-if="!customizing" type="button" class="btn" @click="customizing = true">{{ t('prefsCustomize') }}</button>
            <button v-else type="button" class="btn" @click="userPreferences.savePreferences(choices)">{{ t('prefsSave') }}</button>
            <button type="button" class="btn btn-primary" @click="userPreferences.acceptAll()">{{ t('prefsAcceptAll') }}</button>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useLang } from '@/composables/useLang.js'
import { useUserPreferencesStore } from '@/stores/userPreferences.js'

const { getTranslation: t } = useLang()
const userPreferences = useUserPreferencesStore()
const customizing = ref(false)
const choices = reactive({ ...userPreferences.preferences })

// Opened again from "Cookie settings": the boxes show the current choice
watch(() => userPreferences.hasUserMadeChoice, (made) => {
    if (made) return
    Object.assign(choices, userPreferences.preferences)
    customizing.value = true
})

// Only shown in the browser: the cookie with the choice is not known while the server renders the page
const mounted = ref(false)
onMounted(() => { mounted.value = true })
</script>
