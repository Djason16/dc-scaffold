import { component$ } from '@builder.io/qwik'
import PageHero from '~/components/ui/PageHero/PageHero'
import { useLang } from '~/composables/useLang'
import { t } from '~/plugins/lang'
import { useSite } from '~/composables/useSite'

// First section of the home page: replace it with your content, add the next ones in src/routes/index.tsx
export default component$(() => {
    const lang = useLang()
    const site = useSite()

    return <PageHero title={t(lang, 'introTitle', { name: site.name })} large />
})
