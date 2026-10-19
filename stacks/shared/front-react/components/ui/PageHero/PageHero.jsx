/*
 * Top of a page: small title, large title, text and buttons (assets/css/components/page-hero.css, decorated by the DC Scaffold design while it is on).
 *   <PageHero eyebrow={t('aboutEyebrow')} title={t('aboutTitle')} text={t('aboutText')}>
 *       <AppLink href="/contact/" className="btn btn-primary">{t('contact')}</AppLink>
 *   </PageHero>
 * eyebrow: a text, or any element (the badge of the home page). large: taller, for the home page.
 * AppLink (components/ui/AppLink): links between the pages, without reloading.
 */
export default function PageHero({ eyebrow, title, text, large = false, children }) {
    return (
        <div className={large ? 'page-hero page-hero-large' : 'page-hero'}>
            {typeof eyebrow === 'string' ? <p className="page-hero-eyebrow">{eyebrow}</p> : eyebrow}
            <h1>{title}</h1>
            {text && <p className="page-hero-text">{text}</p>}
            {children && <div className="page-hero-actions">{children}</div>}
        </div>
    )
}
