<script>
    import PageHero from '#lib/components/ui/PageHero/PageHero.svelte'
    import Seo from '#lib/components/ui/Seo/Seo.svelte'
    import { lang } from '#lib/plugins/lang.svelte.js'
</script>

<Seo pageKey="notFound" />

<!-- Content of the page shown for an address that does not exist: the same PageHero as the other pages -->
<section class="section">
    <div class="container">
        <PageHero
            eyebrow={lang.getTranslation('notFoundEyebrow')}
            title={lang.getTranslation('notFoundTitle')}
            text={lang.getTranslation('notFoundText')}
        >
            <a href="/" class="btn btn-primary">{lang.getTranslation('backHome')}</a>
        </PageHero>
    </div>
</section>
