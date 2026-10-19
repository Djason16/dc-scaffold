<!-- Section of the project README. Lines start with a tag: [fr] / [en] = language, [fr-api] / [en-api] = only with a back end -->
[fr] - Production : `start.bat` puis `G` (site statique dans `frontend/.output/public`, à envoyer sur l'hébergement)
[fr-api] - Client de l'API : `frontend/utils/api.js`, importé automatiquement (`api.get('/products')` partout)
[fr-api] - Adresse de l'API : `NUXT_PUBLIC_BACKEND_DOMAIN` dans `frontend/.env` (développement) et `frontend/.env.production`
[en] - Production: `start.bat` then `G` (static site in `frontend/.output/public`, upload it)
[en-api] - API client: `frontend/utils/api.js`, auto-imported (`api.get('/products')` anywhere)
[en-api] - API URL: `NUXT_PUBLIC_BACKEND_DOMAIN` in `frontend/.env` (dev) and `frontend/.env.production`
