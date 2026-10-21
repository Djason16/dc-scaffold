import { component$ } from '@builder.io/qwik'
import AppLink from '~/components/ui/AppLink/AppLink'
import PageHero from '~/components/ui/PageHero/PageHero'
import { useLang } from '~/composables/useLang'
import { t } from '~/plugins/lang'

// Content of the page shown for an address that does not exist: the same PageHero as the other pages
export default component$(() => {
    const lang = useLang()

    return (
        <section class="section">
            <div class="container">
                <PageHero eyebrow={t(lang, 'notFoundEyebrow')} title={t(lang, 'notFoundTitle')} text={t(lang, 'notFoundText')}>
                    <AppLink href="/" class="btn btn-primary">{t(lang, 'backHome')}</AppLink>
                </PageHero>
            </div>
        </section>
    )
})
