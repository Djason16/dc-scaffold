<!-- Section of the project README. Lines start with a tag: [fr] / [en] = language, [fr-api] / [en-api] = only with a back end, [fr-inside] / [fr-separate] = API inside the site / not -->
[fr] - Pages : `frontend/src/pages/*.astro` (un fichier = une page), fichiers statiques dans `frontend/public/`
[fr-separate] - Production : `start.bat` puis `B` (site dans `frontend/dist`, à envoyer)
[fr-inside] - Production : `start.bat` puis `B` (site + API dans un seul serveur Node.js, lancé par `npm start` : voir « Mettre en ligne »)
[fr-api] - Client de l'API : `frontend/src/lib/api.js` → `import { api } from '../lib/api.js'`
[fr-separate] - Adresse de l'API : `PUBLIC_API_URL` dans `frontend/.env` (développement) et `frontend/.env.production` (utilisé tout seul au build)
[fr-inside] - Adresse de l'API : la même que le site, sous `/api` (rien à régler)
[en] - Pages: `frontend/src/pages/*.astro` (one file = one page), static files in `frontend/public/`
[en-separate] - Production: `start.bat` then `B` (site in `frontend/dist`, upload it)
[en-inside] - Production: `start.bat` then `B` (site + API in one Node.js server, started by `npm start`: see "Going online")
[en-api] - API client: `frontend/src/lib/api.js` → `import { api } from '../lib/api.js'`
[en-separate] - API URL: `PUBLIC_API_URL` in `frontend/.env` (dev) and `frontend/.env.production` (used automatically by the build)
[en-inside] - API URL: the same as the site, under `/api` (nothing to set)
