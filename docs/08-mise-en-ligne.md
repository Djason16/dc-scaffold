# 8. Mettre en ligne

[← Sommaire](README.md)

Chaque projet a une section **« Mettre en ligne »** dans son `README.md`, avec **ses** étapes dans l'ordre, et le même
rappel sous le menu de `start.bat`. Cette page explique ces étapes et le pourquoi.

## L'idée à retenir

**Le build du site ne contient que le site.** Ce que tu envoies dépend de l'endroit où vit l'API :

| Projet | Combien d'envois | Hébergement |
| ------ | ---------------- | ----------- |
| Site seul (sans API) | 1 : le site | Statique : n'importe quel hébergeur (même gratuit) |
| API seule (sans site) | 1 : l'API | PHP ou Node.js selon le back end |
| Site + **API séparée** | **2 : le site, puis l'API, à part** | Site : statique. API : PHP ou Node.js. Souvent deux adresses (`example.com`, `api.example.com`) |
| Site + **API dans le site** (Nuxt + Nitro, Next.js, SvelteKit, Astro, Qwik) | 1 : le site et l'API ensemble | **Node.js** |

## Build (`B`) ou Generate (`G`) ?

`start.bat` ne propose que **le choix qui convient** :

| Front | API séparée ou aucune | API dans le site |
| ----- | --------------------- | ---------------- |
| Nuxt | `G` : site statique dans `frontend/.output/public` | `B` : site + API dans `frontend/.output` (serveur Node.js) |
| Next.js | `B` : site statique dans `frontend/out` | `B` : serveur Node.js (`frontend/.next`) |
| SvelteKit | `B` : site statique dans `frontend/build` | `B` : serveur Node.js (`frontend/build`) |
| Astro | `B` : site statique dans `frontend/dist` | `B` : pages dans `frontend/dist/client`, serveur dans `frontend/dist/server` |
| Qwik | `B` : site statique dans `frontend/dist` | `B` : pages dans `frontend/dist`, serveur dans `frontend/server` |
| Vue, React, Svelte, SolidJS, Angular | `B` : site statique dans `frontend/dist` | — |
| HTML / CSS / JS | rien à compiler : `frontend/` tel quel | — |

Avec une **API PHP**, la réponse est donc : `G` (Nuxt) ou `B` (les autres) **pour le site**, puis tu envoies `backend/`
sur un hébergement PHP. L'API PHP ne se compile pas et ne va jamais dans le dossier du site.

## Site + API séparée

Exemple : Nuxt + Slim. Les étapes du README du projet :

1. **Réglages en ligne de l'API**, dans `backend/.env.production` : la base de données de ton hébergeur
   (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`), et `APP_BASE_URL` = l'adresse réelle du site (seul le site peut appeler l'API).
2. **Adresse de l'API en ligne, pour le site**, dans `frontend/.env.production` (`NUXT_PUBLIC_BACKEND_DOMAIN` pour Nuxt,
   `VITE_API_URL` pour Vue, React, Svelte, SolidJS, `NEXT_PUBLIC_API_URL` pour Next.js, `PUBLIC_API_URL` pour SvelteKit,
   Astro et Qwik, `API_URL` pour Angular ; `frontend/js/config.js` pour HTML/CSS/JS). **Avant le build** : l'adresse est
   écrite dans le site au moment du build.
3. **Site** : `start.bat` puis `G` ou `B`, puis envoie **le contenu** du dossier indiqué sur l'hébergement du site.
4. **API, à part** : voir le tableau ci-dessous.

| API | Comment la mettre en ligne |
| --- | -------------------------- |
| Slim 4, Laravel | Envoie `backend/` (avec `vendor/`) sur un hébergement PHP 8.4+ ; l'adresse de l'API pointe sur `backend/public/` |
| Symfony | Pareil, et `APP_ENV=prod` dans `backend/.env.prod.local` |
| PHP | Envoie `backend/` sur un hébergement PHP 8.4+ ; l'adresse pointe sur `backend/public/` (sans Composer) |
| Nitro | `start.bat` puis `A` (compilation dans `backend/.output`), envoie `backend/` sur un hébergement Node.js 22.13+ et lance `npm start` |
| Express | Envoie `backend/` sur un hébergement Node.js 22.13+, puis `npm install --omit=dev` et `npm start` |
| NestJS | `start.bat` puis `A` (compilation dans `backend/dist`), envoie `backend/`, puis `npm install --omit=dev` et `npm start` |
| AdonisJS | `start.bat` puis `A` (compilation dans `backend/build`), envoie `backend/build/` avec `.env.production` renommé `.env`, puis `npm ci --omit=dev` et `node bin/server.js` (Node.js 24+) |

« L'adresse de l'API pointe sur `backend/public/` » : chez l'hébergeur, le domaine (ou sous-domaine) de l'API a pour
dossier racine `backend/public/`. Le reste de `backend/` (code, `.env`, `vendor/`) n'est ainsi pas accessible depuis le web.

## Site + API dans le site

Exemple : SvelteKit + API dans le site.

1. **Réglages en ligne**, dans `frontend/.env.production` : la base de données du serveur.
2. **Site + API** : `start.bat` puis `B` (le site et l'API compilés ensemble), envoie `frontend/` sur un hébergement
   **Node.js 22.13+**, puis `npm install --omit=dev` si les modules ne sont pas envoyés, et lance **`npm start`**.

`npm start` lit `.env.production` et écoute sur le port `PORT` donné par l'hébergeur (3000 par défaut).

| Front | Ce que lance `npm start` |
| ----- | ------------------------ |
| Nuxt + Nitro | `node .output/server/index.mjs` |
| Next.js | `next start` |
| SvelteKit | `node build` (adapter-node) |
| Astro | `node dist/server/entry.mjs` (`@astrojs/node`) |
| Qwik | `node server/entry.node-server.js` (adaptateur Node.js de Qwik) |

Pas d'adresse d'API à régler, pas de CORS : le site et l'API ont la même adresse.

## Site seul

`start.bat` puis `B` (ou `G` pour Nuxt), puis envoie le contenu du dossier indiqué. `sitemap.xml` et `robots.txt` sont
dedans, avec l'adresse `*_SITE_URL` de `frontend/.env.production` : mets-y l'adresse réelle du site avant le build.

Le `.htaccess` fourni (`public/.htaccess`, copié dans le build) gère les adresses du site sur un hébergement Apache :
les pages s'ouvrent même en rechargeant, la 404 du site s'affiche.

## Avant d'envoyer : la liste

- [ ] `frontend/.env.production` : `*_SITE_URL` (adresse réelle du site), et l'adresse de l'API si elle est séparée
- [ ] `.env.production` de l'API : base de données en ligne, `APP_BASE_URL` (API séparée)
- [ ] Les tables existent sur la base en ligne (export SQL depuis phpMyAdmin, import chez l'hébergeur)
- [ ] Le build est refait **après** avoir modifié `.env.production`
- [ ] Les `.env` de développement ne sont pas envoyés (ils contiennent tes mots de passe locaux)
