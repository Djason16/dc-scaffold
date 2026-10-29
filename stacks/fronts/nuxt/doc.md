<!-- Section of the project README. Lines start with a tag: [fr] / [en] = language, [fr-api] / [en-api] = only with a back end, [fr-inside] / [en-inside] = API inside Nuxt (server/), [fr-separate] / [en-separate] = otherwise -->
[fr-separate] - Production : `start.bat` puis `G` (site statique dans `frontend/.output/public`, à envoyer sur l'hébergement)
[fr-inside] - Production : `start.bat` puis `B` (site + API dans `frontend/.output`, lancé par `npm start` sur un hébergement Node.js)
[fr-api] - Client de l'API : `frontend/utils/api.js`, importé automatiquement (`api.get('/products')` partout)
[fr-separate] - Adresse de l'API : `NUXT_PUBLIC_BACKEND_DOMAIN` dans `frontend/.env` (développement) et `frontend/.env.production`
[fr-inside] - Adresse de l'API : la même que le site, sous `/api` (rien à régler)
[en-separate] - Production: `start.bat` then `G` (static site in `frontend/.output/public`, upload it)
[en-inside] - Production: `start.bat` then `B` (site + API in `frontend/.output`, started by `npm start` on a Node.js host)
[en-api] - API client: `frontend/utils/api.js`, auto-imported (`api.get('/products')` anywhere)
[en-separate] - API URL: `NUXT_PUBLIC_BACKEND_DOMAIN` in `frontend/.env` (dev) and `frontend/.env.production`
[en-inside] - API URL: the same as the site, under `/api` (nothing to set)
