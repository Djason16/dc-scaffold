<!-- Section of the project README. Lines start with a tag: [fr] / [en] = language, [fr-api] / [en-api] = only with a back end -->
[fr] - Production : `start.bat` puis `B` (site dans `frontend/dist`, à envoyer)
[fr] - Pages : un fichier par page dans `frontend/src/pages` (`about.svelte` = `/about/`, `blog/[id].svelte` = `/blog/123/`), les liens `<a href="/...">` changent de page sans recharger
[fr-api] - Client de l'API : `frontend/src/lib/api.js` → `import { api } from '#lib/api.js'`
[fr-api] - Adresse de l'API : `VITE_API_URL` dans `frontend/.env` (développement) et `frontend/.env.production` (utilisé tout seul au build)
[en] - Production: `start.bat` then `B` (site in `frontend/dist`, upload it)
[en] - Pages: one file per page in `frontend/src/pages` (`about.svelte` = `/about/`, `blog/[id].svelte` = `/blog/123/`), `<a href="/...">` links change the page without reloading
[en-api] - API client: `frontend/src/lib/api.js` → `import { api } from '#lib/api.js'`
[en-api] - API URL: `VITE_API_URL` in `frontend/.env` (dev) and `frontend/.env.production` (used automatically by the build)
