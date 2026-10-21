import { component$, Slot } from '@builder.io/qwik'

/*
 * Top of a page: small title, large title, text and buttons (assets/css/components/page-hero.css, decorated by the DC Scaffold design while it is on).
 *   <PageHero eyebrow={t('aboutEyebrow')} title={t('aboutTitle')} text={t('aboutText')}>
 *       <AppLink href="/contact/" class="btn btn-primary">{t('contact')}</AppLink>
 *   </PageHero>
 * q:slot="eyebrow": shown instead of the eyebrow text (the badge of the home page). large: taller, for the home page.
 * AppLink (components/ui/AppLink): links between the pages, without reloading.
 */
type Props = { eyebrow?: string, title: string, text?: string, large?: boolean }

export default component$((props: Props) => (
    <div class={props.large ? 'page-hero page-hero-large' : 'page-hero'}>
        {props.eyebrow && <p class="page-hero-eyebrow">{props.eyebrow}</p>}
        <Slot name="eyebrow" />
        <h1>{props.title}</h1>
        {props.text && <p class="page-hero-text">{props.text}</p>}
        <div class="page-hero-actions">
            <Slot />
        </div>
    </div>
))
