import { useLang } from '@/composables/useLang.js'

// Full screen shown while the page gets ready (AppShell)
export default function Loader() {
    const { getTranslation: t } = useLang()
    return (
        <div className="loader" role="status" aria-label={t('loading')}>
            <span className="loader-spinner" />
        </div>
    )
}
