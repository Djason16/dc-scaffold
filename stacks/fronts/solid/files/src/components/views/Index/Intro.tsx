import PageHero from '@/components/ui/PageHero/PageHero'
import { useLang } from '@/composables/useLang'
import { useSite } from '@/composables/useSite'

// First section of the home page: replace it with your content, add the next ones in pages/index.jsx
export default function Intro() {
    const { getTranslation: t } = useLang()
    const site = useSite()

    return <PageHero title={t('introTitle', { name: site.name })} large />
}
