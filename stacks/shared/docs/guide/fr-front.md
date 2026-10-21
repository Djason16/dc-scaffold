## Le site

Le site est dans `frontend/`.

### Design

Le site s'ouvre avec le design de DC Scaffold : thème sombre, police Barlow Condensed, écran de chargement
et page d'accueil « Et maintenant ? ». Un seul réglage le coupe ou le remet, dans `{{FRONT_DESIGN_CONFIG}}` :

- `design: true` : le design de DC Scaffold (tout est dans `{{FRONT_DESIGN_FOLDER}}/`)
- `design: false` : un site vide au style simple (fond blanc, police du système), pour faire ton propre design.
  Plus rien du design de DC Scaffold ne va dans le site : ni son thème, ni ses polices, ni sa page d'accueil, ni l'écran de chargement.
  La page d'accueil affiche tes sections (`{{FRONT_HOME_SECTIONS}}`).

{{FRONT_DESIGN_RESTART}} Une fois ton design prêt, tu peux supprimer `{{FRONT_DESIGN_FOLDER}}/` et `{{FRONT_PUBLIC}}/dc-scaffold/` (ses logos).

### Couleurs, polices et tailles

- **Couleurs, polices, tailles des textes, espacements** : `{{FRONT_CSS}}/utils/variables.css`.
  Change une valeur (par exemple `--accent-color`) et tout le site suit.
- **Thème** : clair dans le style simple. Tous les composants utilisent `--background-color`, `--surface-color`,
  `--border-color`, `--text-color`, `--text-color-muted` et `--accent-color` : change ces variables pour un autre style ou un site sombre.
  Avec `design: true`, le thème de DC Scaffold (`{{FRONT_DESIGN_FOLDER}}/theme.css`) remplace ces couleurs.
- **Police** : celle du système dans le style simple. Pour une autre : mets ses fichiers dans `{{FRONT_PUBLIC}}/fonts/`,
  déclare-la dans `{{FRONT_CSS}}/utils/fonts.css` (un exemple y est écrit), puis mets son nom en premier dans `--font-primary` (`utils/variables.css`).
- **Style d'un composant** : un fichier par composant dans `{{FRONT_CSS}}/components/`, importé dans `{{FRONT_CSS}}/main.css`.

### Textes

[two-languages] Tous les textes sont dans `{{FRONT_TRANSLATIONS}}/`, un fichier par partie du site :
[two-languages]
[two-languages] ```js
[two-languages] // {{FRONT_TRANSLATIONS}}/pages/index.js
[two-languages] export default {
[two-languages]     fr: { introTitle: 'Bienvenue' },
[two-languages]     en: { introTitle: 'Welcome' },
[two-languages] }
[two-languages] ```
[two-languages]
[two-languages] Pour l'afficher : {{FRONT_TEXT_USAGE}}. Un texte introuvable affiche sa clé, facile à repérer sur la page.
[two-languages] Nouveau fichier de textes : crée-le, puis ajoute-le dans `{{FRONT_TRANSLATIONS}}/translations.js` (`TRANSLATIONS`).
[one-language] Le site est en une seule langue : les textes sont écrits directement dans les composants et les pages,
[one-language] sans système de traduction. Pour changer un texte, ouvre le composant qui l'affiche (par exemple `{{FRONT_VIEWS}}/Index/`
[one-language] pour la page d'accueil) et modifie-le.

### Langues

[two-languages] Les langues du site sont dans `{{FRONT_TRANSLATIONS}}/translations.js` (`LANGUAGES`), la première est celle par défaut.

[two-languages] Le site est en deux langues : les boutons de langue sont en bas à droite (`ChangeLanguageButton`, dans l'AppShell).
[two-languages] Chaque fichier de textes a un bloc par langue. La langue choisie par le visiteur n'est gardée pour sa prochaine visite
[two-languages] que s'il accepte les cookies fonctionnels.
[one-language] Le site est en une seule langue, comme demandé : pas de boutons de langue ni de fichiers de traduction.
[one-language] Pour un site en deux langues, crée le projet avec DC Scaffold en choisissant deux langues.

### Cookies (bandeau)

Le choix du visiteur est dans `{{FRONT_STORE}}` ({{FRONT_STORE_LIB}}).

**Ajouter une catégorie**, par exemple `maps` pour une carte interactive :

[two-languages] 1. dans `{{FRONT_STORE}}`, ajoute `maps: false` dans `preferences` et `maps: { required: false }` dans `categories`
[two-languages]    (`required: true` = toujours actif, le visiteur ne peut pas le refuser)
[two-languages] 2. dans `{{FRONT_TRANSLATIONS}}/common/preferences.js`, ajoute `mapsLabel` et `mapsDescription` dans chaque langue
[one-language] 1. dans `{{FRONT_STORE}}`, ajoute `maps: false` dans `preferences`
[one-language] 2. et `maps: { required: false, label: 'Carte', description: 'Affiche une carte interactive' }` dans `categories`
[one-language]    (`required: true` = toujours actif, le visiteur ne peut pas le refuser ; `label` et `description` : textes du bandeau)
3. dans ton code : `if ({{FRONT_PREFS_USAGE}}) { ... }` pour n'afficher la carte qu'avec l'accord du visiteur

Le nom du cookie et sa durée (180 jours) sont en haut de `{{FRONT_ACTIONS}}`.
[two-languages] Les textes du bandeau sont dans `{{FRONT_TRANSLATIONS}}/common/preferences.js`.
[one-language] Les textes du bandeau sont dans son composant, `PreferencesBanner`.

### Nouvelle page

- crée `{{FRONT_PAGE}}` (copie `{{FRONT_PAGE_COPY}}` pour partir d'un exemple)
- commence-la par le haut de page réutilisable **PageHero** (petit titre, grand titre, texte, boutons) :
  `{{FRONT_PAGE_HERO}}`. La page d'accueil et la page 404 l'utilisent déjà : tout le site garde le même style
- mets ses sections dans `{{FRONT_VIEWS}}/About/` (une section = un composant)
[two-languages] - ajoute la page dans `SEO_PAGES` de `{{FRONT_SEO}}`, puis son titre et sa description
[two-languages]    dans `{{FRONT_TRANSLATIONS}}/common/seo.js` (`seoAboutTitle`, `seoAboutDescription`)
[one-language] - ajoute la page dans `SEO_PAGES` de `{{FRONT_SEO}}`, avec son titre et sa description

### SEO

[two-languages] - Titre, description et image de partage de chaque page : `{{FRONT_SEO}}` et `{{FRONT_TRANSLATIONS}}/common/seo.js`
[one-language] - Titre, description et image de partage de chaque page : `{{FRONT_SEO}}` (`SEO_PAGES`)
- Image de partage par défaut : `{{FRONT_PUBLIC}}/og-image.jpg` (1200 × 630 px)
- `sitemap.xml` et `robots.txt` sont créés automatiquement avec le site de production

### Nom et adresse du site

{{FRONT_SITE_CONFIG}}

### Accès et redirections

Les règles exécutées avant chaque page (rediriger, protéger une page admin...) sont dans `{{FRONT_MIDDLEWARE}}`.

### Cadre des pages (AppShell)

Ce qui entoure chaque page, et aussi la page 404, est dans `{{FRONT_LAYOUT}}` :
[two-languages] écran de chargement, en-tête (menu), pied de page, boutons flottants (retour en haut, langues) et bandeau cookies.
[one-language] écran de chargement, en-tête (menu), pied de page, bouton retour en haut et bandeau cookies.

- **Menu** : ajoute tes liens dans l'en-tête (`{{FRONT_HEADER}}`)
- **Pied de page** : `{{FRONT_FOOTER}}` (le bouton « Gérer les cookies » rouvre le bandeau sur le choix actuel)
- **Écran de chargement** : au chargement et à chaque changement de page, avec le design de DC Scaffold ; `LOADER_ENABLED` en haut de l'AppShell : `true` pour toujours l'avoir, `false` pour jamais
- **Durée minimale du chargement** entre deux pages : `LOADER_PAGE_TIME` en haut de l'AppShell (400 ms)

### Bon à savoir ({{FRONT_LABEL}})

{{FRONT_DOC}}
