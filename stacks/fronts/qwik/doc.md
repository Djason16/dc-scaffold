<!-- Section of the project README. Lines start with a tag: [fr] / [en] = language, [fr-api] / [en-api] = only with a back end -->
[fr] - Production : `start.bat` puis `B` (site statique dans `frontend/dist`, à envoyer)
[fr] - Pages : un dossier par page dans `frontend/src/routes` (`about/index.tsx` = `/about/`), avec `export const head: DocumentHead = { frontmatter: { pageKey: 'about' } }` pour son SEO
[fr] - Qwik est en TypeScript : les composants s'écrivent avec `component$`, les événements avec `onClick$`
[fr-api] - Client de l'API : `frontend/src/utils/api.js` → `import { api } from '~/utils/api.js'`
[fr-api] - Adresse de l'API : `PUBLIC_API_URL` dans `frontend/.env` (développement) et `frontend/.env.production`
[en] - Production: `start.bat` then `B` (static site in `frontend/dist`, upload it)
[en] - Pages: one folder per page in `frontend/src/routes` (`about/index.tsx` = `/about/`), with `export const head: DocumentHead = { frontmatter: { pageKey: 'about' } }` for its SEO
[en] - Qwik is in TypeScript: components are written with `component$`, events with `onClick$`
[en-api] - API client: `frontend/src/utils/api.js` → `import { api } from '~/utils/api.js'`
[en-api] - API URL: `PUBLIC_API_URL` in `frontend/.env` (dev) and `frontend/.env.production`
