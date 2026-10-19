import AppLink from '@/components/ui/AppLink/AppLink.jsx'
import PageHero from '@/components/ui/PageHero/PageHero.jsx'
import Seo from '@/components/ui/Seo/Seo.jsx'
import { useLang } from '@/composables/useLang.js'

// Content of the page shown for an address that does not exist: the same PageHero as the other pages
export default function NotFound() {
    const { getTranslation: t } = useLang()
    return (
        <section className="section">
            <Seo pageKey="notFound" />
            <div className="container">
                <PageHero eyebrow={t('notFoundEyebrow')} title={t('notFoundTitle')} text={t('notFoundText')}>
                    <AppLink href="/" className="btn btn-primary">{t('backHome')}</AppLink>
                </PageHero>
            </div>
        </section>
    )
}
