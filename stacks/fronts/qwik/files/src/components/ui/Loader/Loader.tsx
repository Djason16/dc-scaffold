import { component$ } from '@builder.io/qwik'
import { useLang } from '~/composables/useLang'
import { t } from '~/plugins/lang'

// Full screen shown while the page gets ready (AppShell)
export default component$(() => {
    const lang = useLang()
    return (
        <div class="loader" role="status" aria-label={t(lang, 'loading')}>
            <span class="loader-spinner" />
        </div>
    )
})
