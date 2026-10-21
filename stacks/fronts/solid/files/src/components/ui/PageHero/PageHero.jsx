import { Show } from 'solid-js'

/*
 * Top of a page: small title, large title, text and buttons (assets/css/components/page-hero.css, decorated by the DC Scaffold design while it is on).
 *   <PageHero eyebrow={t('aboutEyebrow')} title={t('aboutTitle')} text={t('aboutText')}>
 *       <AppLink href="/contact/" class="btn btn-primary">{t('contact')}</AppLink>
 *   </PageHero>
 * eyebrow: a text, or any element (the badge of the home page). large: taller, for the home page.
 * AppLink (components/ui/AppLink): links between the pages, without reloading.
 */
export default function PageHero(props) {
    return (
        <div class={props.large ? 'page-hero page-hero-large' : 'page-hero'}>
            {typeof props.eyebrow === 'string' ? <p class="page-hero-eyebrow">{props.eyebrow}</p> : props.eyebrow}
            <h1>{props.title}</h1>
            <Show when={props.text}>
                <p class="page-hero-text">{props.text}</p>
            </Show>
            <Show when={props.children}>
                <div class="page-hero-actions">{props.children}</div>
            </Show>
        </div>
    )
}
