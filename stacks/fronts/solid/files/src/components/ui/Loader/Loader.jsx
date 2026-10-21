import { useLang } from '@/composables/useLang.js'

// Full screen shown while the page gets ready (AppShell)
export default function Loader() {
    const { getTranslation: t } = useLang()
    return (
        <div class="loader" role="status" aria-label={t('loading')}>
            <span class="loader-spinner" />
        </div>
    )
}
