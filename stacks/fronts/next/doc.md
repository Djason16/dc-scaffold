<!-- Section of the project README. Lines start with a tag: [fr] / [en] = language, [fr-api] / [en-api] = only with a back end -->
[fr] - Production : `start.bat` puis `B` (site statique dans `frontend/out`, à envoyer). Pour un serveur Node.js, enlève `output: 'export'` dans `next.config.mjs`
[fr-api] - Client de l'API : `frontend/utils/api.js` → `import { api } from '@/utils/api.js'` (dans les composants `'use client'`)
[fr-api] - Adresse de l'API : `NEXT_PUBLIC_API_URL` dans `frontend/.env` (développement) et `frontend/.env.production`
[en] - Production: `start.bat` then `B` (static site in `frontend/out`, upload it). For a Node.js server, remove `output: 'export'` in `next.config.mjs`
[en-api] - API client: `frontend/utils/api.js` → `import { api } from '@/utils/api.js'` (in `'use client'` components)
[en-api] - API URL: `NEXT_PUBLIC_API_URL` in `frontend/.env` (dev) and `frontend/.env.production`
