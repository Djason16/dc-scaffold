<!-- Section of the project README. Lines start with a tag: [fr] / [en] = language, [fr-api] / [en-api] = only with a back end -->
[fr] - Production : `start.bat` puis `B` (site dans `frontend/dist`, à envoyer)
[fr] - Pages : un fichier par page dans `frontend/src/pages` (`about.jsx` = `/about`, `blog/[id].jsx` = `/blog/123`), Solid Router les lit tout seul (`src/routes.js`)
[fr-api] - Client de l'API : `frontend/src/utils/api.js` → `import { api } from '@/utils/api.js'`
[fr-api] - Adresse de l'API : `VITE_API_URL` dans `frontend/.env` (développement) et `frontend/.env.production` (utilisé tout seul au build)
[en] - Production: `start.bat` then `B` (site in `frontend/dist`, upload it)
[en] - Pages: one file per page in `frontend/src/pages` (`about.jsx` = `/about`, `blog/[id].jsx` = `/blog/123`), Solid Router reads them by itself (`src/routes.js`)
[en-api] - API client: `frontend/src/utils/api.js` → `import { api } from '@/utils/api.js'`
[en-api] - API URL: `VITE_API_URL` in `frontend/.env` (dev) and `frontend/.env.production` (used automatically by the build)
