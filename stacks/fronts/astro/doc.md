<!-- Section of the project README. Lines start with a tag: [fr] / [en] = language, [fr-api] / [en-api] = only with a back end -->
[fr] - Pages : `frontend/src/pages/*.astro` (un fichier = une page), fichiers statiques dans `frontend/public/`
[fr] - Production : `start.bat` puis `B` (site dans `frontend/dist`, à envoyer)
[fr-api] - Client de l'API : `frontend/src/lib/api.js` → `import { api } from '../lib/api.js'`
[fr-api] - Adresse de l'API : `PUBLIC_API_URL` dans `frontend/.env` (développement) et `frontend/.env.production` (utilisé tout seul au build)
[en] - Pages: `frontend/src/pages/*.astro` (one file = one page), static files in `frontend/public/`
[en] - Production: `start.bat` then `B` (site in `frontend/dist`, upload it)
[en-api] - API client: `frontend/src/lib/api.js` → `import { api } from '../lib/api.js'`
[en-api] - API URL: `PUBLIC_API_URL` in `frontend/.env` (dev) and `frontend/.env.production` (used automatically by the build)
