import { useLang } from '@/composables/useLang'

// The loading screen of the site (AppShell), on the first opening and on every page change: "Loading" over a thin line
export default function Loader() {
    const { getTranslation: t } = useLang()
    return (
        <div className="loader" role="status" aria-live="polite">
            <p className="loader-label">{t('loading')}</p>
            <span className="loader-line" aria-hidden="true" />
        </div>
    )
}
