import { component$ } from '@builder.io/qwik'
import { useLang } from '~/composables/useLang'
import { t } from '~/plugins/lang'

// The loading screen of the site (AppShell), on the first opening and on every page change: "Loading" over a thin line
export default component$(() => {
    const lang = useLang()
    return (
        <div class="loader" role="status" aria-live="polite">
            <p class="loader-label">{t(lang, 'loading')}</p>
            <span class="loader-line" aria-hidden="true" />
        </div>
    )
})
