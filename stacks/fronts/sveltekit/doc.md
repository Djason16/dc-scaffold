<!-- Section of the project README. Lines start with a tag: [fr] / [en] = language, [fr-api] / [en-api] = only with a back end, [fr-inside] / [fr-separate] = API inside the site / not -->
[fr-separate] - Production : `start.bat` puis `B` (site statique dans `frontend/build`, à envoyer)
[fr-inside] - Production : `start.bat` puis `B` (site + API dans un seul serveur Node.js, lancé par `npm start` : voir « Mettre en ligne »)
[fr-api] - Client de l'API : `frontend/src/lib/api.js` → `import { api } from '#lib/api.js'`
[fr-separate] - Adresse de l'API : `PUBLIC_API_URL` dans `frontend/.env` (développement) et `frontend/.env.production`
[fr-inside] - Adresse de l'API : la même que le site, sous `/api` (rien à régler)
[en-separate] - Production: `start.bat` then `B` (static site in `frontend/build`, upload it)
[en-inside] - Production: `start.bat` then `B` (site + API in one Node.js server, started by `npm start`: see "Going online")
[en-api] - API client: `frontend/src/lib/api.js` → `import { api } from '#lib/api.js'`
[en-separate] - API URL: `PUBLIC_API_URL` in `frontend/.env` (dev) and `frontend/.env.production`
[en-inside] - API URL: the same as the site, under `/api` (nothing to set)
