<!-- Section of the project README. Lines start with a tag: [fr] / [en] = language, [fr-api] / [en-api] = only with a back end, [fr-one-language] / [fr-two-languages]... = only for that number of languages -->
[fr] - Nouvelle page : ajoute aussi sa ligne dans `frontend/src/app/app.routes.ts` (Angular ne lit pas le dossier `pages/` tout seul)
[fr] - Composants : un fichier `.ts` par composant, avec son HTML dans `template` ; les styles restent dans `frontend/src/assets/css`
[fr-two-languages] - Textes dans un composant : `protected lang = useLang()`, puis `{{ lang.getTranslation('introTitle') }}` dans son `template`
[fr] - Réglages : `frontend/.env` et `frontend/.env.production`, copiés dans `src/environments/environment.ts` par `scripts/env.mjs` à chaque `npm run dev` / `npm run build`
[fr] - Production : `start.bat` puis `B` (site dans `frontend/dist`, à envoyer)
[fr-api] - Client de l'API : `frontend/src/app/utils/api.js` → `import { api } from '@/utils/api.js'`
[fr-api] - Adresse de l'API : `API_URL` dans `frontend/.env` (développement) et `frontend/.env.production` (utilisé tout seul au build)
[en] - New page: also add its line in `frontend/src/app/app.routes.ts` (Angular does not read the `pages/` folder by itself)
[en] - Components: one `.ts` file per component, with its HTML in `template`; the styles stay in `frontend/src/assets/css`
[en-two-languages] - Texts in a component: `protected lang = useLang()`, then `{{ lang.getTranslation('introTitle') }}` in its `template`
[en] - Settings: `frontend/.env` and `frontend/.env.production`, copied into `src/environments/environment.ts` by `scripts/env.mjs` on every `npm run dev` / `npm run build`
[en] - Production: `start.bat` then `B` (site in `frontend/dist`, upload it)
[en-api] - API client: `frontend/src/app/utils/api.js` → `import { api } from '@/utils/api.js'`
[en-api] - API URL: `API_URL` in `frontend/.env` (dev) and `frontend/.env.production` (used automatically by the build)
