# 5. Le site (front)

[← Sommaire](README.md)

Tous les fronts ont **la même architecture**. Les chemins exacts de ton projet sont dans son `README.md` ; ici, les
chemins sont donnés pour Nuxt (`frontend/...`), les autres fronts ont les mêmes dossiers (souvent sous `src/`).

## L'architecture commune

```
frontend/
├── assets/css/          styles : utils/variables.css (couleurs, polices, tailles), components/ (un fichier par composant), main.css
├── components/
│   ├── layout/          AppShell (cadre de chaque page), Header (menu), Footer (pied de page)
│   ├── ui/              PageHero, Button (retour en haut, langues), Loader, PreferencesBanner (cookies), SectionLayout
│   └── views/           les sections des pages (Index/, NotFound/...)
├── composables/         useSite (nom et adresse du site), useSeo, useLang
├── middleware/          règles exécutées avant chaque page (redirections, pages protégées)
├── pages/               une page = un fichier
├── plugins/             lang (langue courante) et translations/ (les textes), avec deux langues
├── stores/              userPreferences (choix du bandeau cookies)
├── utils/               seo.js (titre et description de chaque page), pathHelpers.js, api.js (client de l'API)
├── dc-scaffold/         le design de DC Scaffold (thème, accueil « Et maintenant ? »)
├── dc-scaffold.config.js  l'interrupteur du design
└── public/              fichiers servis tels quels (favicon, images, og-image.jpg)
```

## Le design : DC Scaffold ou page blanche

`frontend/dc-scaffold.config.js` :

- `design: true` (par défaut) : le design de DC Scaffold : thème sombre, police Barlow Condensed, écran de chargement,
  page d'accueil « Et maintenant ? ».
- `design: false` : un site vide au style simple (fond blanc, police du système). **Plus rien du design de DC Scaffold
  ne va dans le build** : ni thème, ni polices, ni accueil, ni écran de chargement. La page d'accueil affiche tes sections.

Le script `scripts/design.mjs` lit ce réglage avant chaque `npm run dev` et chaque build : relance le serveur de
développement après l'avoir changé (HTML/CSS/JS le lit directement dans le navigateur). Quand ton design est prêt, tu
peux supprimer le dossier `dc-scaffold/` et `public/dc-scaffold/`.

## Couleurs, polices, tailles

- **Tout le style global** : `assets/css/utils/variables.css`. Change une valeur (par exemple `--accent-color`), tout le site suit.
- **Couleurs du thème** : `--background-color`, `--surface-color`, `--border-color`, `--text-color`, `--text-color-muted`,
  `--accent-color`. Avec `design: true`, `dc-scaffold/theme.css` les remplace.
- **Police** : mets ses fichiers dans `public/fonts/`, déclare-la dans `assets/css/utils/fonts.css` (un exemple y est),
  puis mets son nom en premier dans `--font-primary`.
- **Un composant** : son fichier dans `assets/css/components/`, importé par `main.css`.

## Les textes et les langues

**Deux langues** (choisies à la création) :

- tous les textes sont dans `plugins/translations/`, un fichier par partie du site, un bloc par langue :
  ```js
  export default {
      fr: { introTitle: 'Bienvenue' },
      en: { introTitle: 'Welcome' },
  }
  ```
- un nouveau fichier de textes s'ajoute dans `plugins/translations/translations.js` (`TRANSLATIONS`) ;
- les langues sont dans `LANGUAGES` du même fichier, la première est celle par défaut ;
- un texte introuvable affiche sa clé : facile à repérer ;
- les boutons de langue sont en bas à droite ; la langue choisie n'est gardée que si le visiteur accepte les cookies fonctionnels.

**Une langue** : pas de système de traduction. Les textes sont écrits directement dans les composants
(par exemple `components/views/Index/` pour l'accueil). Pour passer à deux langues, recrée le projet avec deux langues.

## Le bandeau cookies

Le choix du visiteur est dans `stores/userPreferences.js`. Pour ajouter une catégorie (par exemple une carte interactive) :

1. ajoute `maps: false` dans `preferences` et `maps: { required: false }` dans `categories` ;
2. ajoute ses textes (`mapsLabel`, `mapsDescription`) dans `plugins/translations/common/preferences.js`
   (avec une langue : `label` et `description` directement dans `categories`) ;
3. dans ton code, n'affiche la carte qu'avec l'accord du visiteur (`userPreferences.preferences.maps`).

`required: true` = toujours actif. Le nom du cookie et sa durée (180 jours) sont en haut de
`stores/actions/userPreferencesActions.js`. « Gérer les cookies », dans le pied de page, rouvre le bandeau.

## Une nouvelle page

1. Crée le fichier de la page (copie `pages/index.vue` pour partir d'un exemple).
2. Commence-la par **PageHero** (`components/ui/PageHero/`) : petit titre, grand titre, texte, boutons. L'accueil et la
   page 404 l'utilisent déjà : le site garde le même style.
3. Mets ses sections dans `components/views/About/` (une section = un composant).
4. Ajoute la page dans `SEO_PAGES` de `utils/seo.js`, avec son titre et sa description.
5. Ajoute le lien dans le menu (`components/layout/Header/`).

## SEO

- Titre, description et image de partage de chaque page : `utils/seo.js` (et `plugins/translations/common/seo.js` avec deux langues).
- Image de partage par défaut : `public/og-image.jpg` (1200 × 630 px).
- **`sitemap.xml` et `robots.txt` sont créés automatiquement** avec le site de production, à partir de l'adresse
  `*_SITE_URL` de `.env.production`.
- Chaque page porte `<meta name="generator" content="DC Scaffold">` ; une ligne à retirer dans `utils/seo.js` pour le cacher.

## Le cadre des pages (AppShell)

`components/layout/AppShell/` entoure chaque page (et la 404) : écran de chargement, en-tête, pied de page, boutons
flottants (retour en haut, langues), bandeau cookies.

- `LOADER_ENABLED` : `true` pour toujours avoir l'écran de chargement, `false` pour jamais (par défaut : avec le design).
- `LOADER_PAGE_TIME` : durée minimale du chargement entre deux pages (400 ms).

## Appeler l'API

Avec un back end, le site a un client `api.js` (chemin exact dans le README du projet) :

```js
await api.get('/products')
await api.post('/products', { name: 'Shirt' })      // corps JSON
await api.post('/media', formData)                  // FormData envoyé tel quel
await api.put('/products/1', data)
await api.patch('/products/1', data)
await api.delete('/products/1')
await api.upload('/media', formData, (percent) => {})
await api.download('/products/export', 'products.csv')
```

Chaque appel **ne lève jamais d'erreur** : il renvoie le JSON de l'API (`{ success: true, ... }`), ou
`{ success: false, error: 'message', status: 404, ... }` (serveur arrêté, adresse inconnue, erreur de l'API compris).
Les cookies sont envoyés (`credentials: 'include'`). En développement, chaque appel s'affiche dans la console (`[API]`).

**Où le client trouve l'API :**

| Projet | Adresse utilisée |
| ------ | ---------------- |
| API séparée | La variable du front (`VITE_API_URL`, `NUXT_PUBLIC_BACKEND_DOMAIN`...) de `.env` en développement, `.env.production` au build |
| API dans le site | Le même site, sous `/api` : rien à régler |

Avec l'API dans le site, une page **pré-rendue au build** qui appelle l'API pendant la compilation ne trouve pas encore
de serveur : appelle l'API depuis le navigateur (au clic, au chargement côté client), ou rends cette page à chaque visite.
Nuxt + Nitro appelle l'API à l'intérieur du serveur, même au premier affichage.

## Bon à savoir par framework

| Front | À savoir |
| ----- | -------- |
| Nuxt | `api` est importé automatiquement partout. Production : `G` (statique) ; avec Nitro dans Nuxt : `B` puis `npm start` |
| Next.js | Le client s'importe avec `import { api } from '@/utils/api.js'`, dans les composants `'use client'` |
| SvelteKit | Imports avec `#lib/...` (SvelteKit 3) ; `svelte-check` vérifie les types |
| Vue / React / Svelte / SolidJS | Applications sur une seule page : les pages de `src/pages/` deviennent les routes ; `.htaccess` fourni pour Apache |
| Angular | Pages dans `src/app/pages/` ; `npx tsc -p tsconfig.app.json` vérifie comme VS Code |
| Qwik | Textes écrits `t(lang, 'clé')` ; types vérifiés pendant le build |
| Astro | Pages `.astro` statiques ; les scripts du navigateur lisent le design et la langue |
| HTML / CSS / JS | Servi par nginx dans Docker en développement, sans compilation ; pages dans `pages/*.html`, scripts en modules ES dans `js/` ; adresse de l'API dans `js/config.js` |
