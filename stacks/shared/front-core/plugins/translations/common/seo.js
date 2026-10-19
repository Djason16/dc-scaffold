// Title and description of each page of utils/seo.js: seo<Page>Title and seo<Page>Description
// "{{name}}" is the site name (SITE_NAME in .env)
export default {
    fr: {
        seoIndexTitle: '{{name}}',
        seoIndexDescription: 'Bienvenue sur {{name}}.',
        seoNotFoundTitle: 'Page introuvable | {{name}}',
        seoNotFoundDescription: "Cette page n'existe pas.",
    },
    en: {
        seoIndexTitle: '{{name}}',
        seoIndexDescription: 'Welcome to {{name}}.',
        seoNotFoundTitle: 'Page not found | {{name}}',
        seoNotFoundDescription: 'This page does not exist.',
    },
}
