# 3. Choisir front et back end

[← Sommaire](README.md)

- Le **front** est le site : ce que les visiteurs voient dans leur navigateur. Il est dans `frontend/`.
- Le **back end** (ou **API**) est le serveur qui enregistre et renvoie les données (comptes, articles, commandes...).
  Le site lui parle par des adresses comme `/products`. Il est dans `backend/`, ou dans le site lui-même (voir plus bas).
- Les deux sont **facultatifs** : un site sans API (vitrine, blog statique), ou une API sans site.

## Les fronts

| Front | Pour quoi | Port | Production (`start.bat`) | Pages | Store |
| ----- | --------- | ---- | ------------------------ | ----- | ----- |
| **Nuxt** | Site complet, basé sur Vue, une page = un fichier | 3000 | `G` : site statique (`.output/public`) | `pages/` | Pinia |
| **Next.js** | Basé sur React, une page = un fichier, très demandé | 3000 | `B` : site statique (`out/`) | `pages/` | Zustand |
| **SvelteKit** | Basé sur Svelte, très léger, une page = un fichier | 5173 | `B` : site statique (`build/`) | `src/routes/` | Svelte `$state` |
| **Vue (Vite)** | Application sur une seule page, facile à prendre en main | 5173 | `B` : `dist/` | `src/pages/` | Pinia |
| **React (Vite)** | Application sur une seule page, la bibliothèque la plus utilisée | 5173 | `B` : `dist/` | `src/pages/` | Zustand |
| **Svelte (Vite)** | Application sur une seule page, très légère | 5173 | `B` : `dist/` | `src/pages/` | Svelte `$state` |
| **SolidJS (Vite)** | Comme React, plus rapide et plus léger | 5173 | `B` : `dist/` | `src/pages/` | Solid `createMutable` |
| **Angular** | Le framework complet de Google, en TypeScript | 4200 | `B` : `dist/` | `src/app/pages/` | signals d'Angular |
| **Qwik** | Pages instantanées, presque sans JavaScript | 5173 | `B` : site statique (`dist/`) | `src/routes/` | Qwik `useStore` |
| **Astro** | Sites de contenu (blog, vitrine), très rapide | 4321 | `B` : `dist/` | `src/pages/` | `utils/store.js` |
| **HTML / CSS / JS** | Le plus simple, rien d'autre à apprendre | 8080 | rien à compiler : `frontend/` tel quel | `pages/*.html` | `utils/store.js` |

Tous les fronts ont la même architecture (AppShell, bandeau cookies, page 404, SEO, `sitemap.xml`, une ou deux langues,
design de DC Scaffold ou page blanche) : voir [5. Le site](05-le-site.md).

## Les back ends

| Back end | Langage | Tourne | Base de données | Contrôleurs |
| -------- | ------- | ------ | --------------- | ----------- |
| **Slim 4** | PHP, léger, idéal pour apprendre | Docker (PHP + Apache) | MySQL (`mysqli` ou `PDO`) | `src/Controllers/` |
| **Laravel** | PHP complet, le plus populaire | Docker | MySQL | `app/Http/Controllers/` |
| **Symfony** | PHP complet et très structuré | Docker | MySQL | `src/Controller/` |
| **PHP** | PHP sans framework, chez tous les hébergeurs | Docker | MySQL (`mysqli` ou `PDO`) | `src/Controllers/` |
| **Nitro** | JavaScript, le serveur de Nuxt | Node.js | MySQL ou SQLite | `controllers/` |
| **Express** | JavaScript, simple et très utilisé | Node.js | MySQL ou SQLite | `controllers/` |
| **NestJS** | TypeScript, structuré comme Angular | Node.js | MySQL ou SQLite | `src/controllers/` |
| **AdonisJS** | TypeScript, tout est prévu comme Laravel (Node.js 24+) | Node.js | MySQL ou SQLite | `app/controllers/` |
| **API dans le site** | JavaScript, dans Next.js, SvelteKit, Astro ou Qwik | le serveur du front | MySQL ou SQLite | dans le site (voir plus bas) |

Tous ont les mêmes helpers (`ResponseHelper`, `RequestHelper`, `fetchAll`...), les **routes automatiques**
(`getAll()` dans `ProductsController` → `GET /products`) et le même format JSON : voir [6. L'API](06-l-api.md).

## API séparée ou API dans le site

C'est **le choix le plus important pour la mise en ligne**. DC Scaffold le fait pour toi selon le couple choisi :

### API séparée (le cas par défaut)

```
mon-projet/
├── backend/    l'API : un programme à part
└── frontend/   le site
```

- Deux programmes, deux adresses en développement (par exemple http://localhost:3000 pour le site, http://localhost:8000 pour l'API).
- Le build du site (`B` ou `G`) ne contient **que le site**. L'API s'envoie **à part**, sur son propre hébergement
  (PHP ou Node.js). En ligne, ce sont souvent deux adresses : `example.com` et `api.example.com`.
- Le site doit connaître l'adresse de l'API (`VITE_API_URL`, `NUXT_PUBLIC_BACKEND_DOMAIN`... dans `frontend/.env.production`),
  et l'API doit connaître l'adresse du site (`APP_BASE_URL`, pour le CORS).
- Avantage : le site reste **statique** (n'importe quel hébergeur, même gratuit) ; l'API peut être en PHP.

C'est le cas de **tous les couples**, sauf les deux suivants.

### API dans le site (un seul serveur)

Certains fronts ont **leur propre serveur**. L'API peut alors vivre dedans :

| Couple | Où va l'API | Comment le choisir |
| ------ | ----------- | ------------------ |
| **Nuxt + Nitro** | `frontend/server/` | Choisis Nitro : c'est automatique, Nitro est déjà le serveur de Nuxt |
| **Next.js + API dans le site** | `frontend/server/` (+ `app/api/[[...path]]/route.js`) | Choisis la carte « API dans le site » |
| **SvelteKit + API dans le site** | `frontend/src/lib/server/` (+ `src/routes/api/[...path]/+server.js`) | Choisis la carte « API dans le site » |
| **Astro + API dans le site** | `frontend/src/server/` (+ `src/pages/api/[...path].js`) | Choisis la carte « API dans le site » |
| **Qwik + API dans le site** | `frontend/src/server/` (+ `src/routes/api/[...path]/index.ts`) | Choisis la carte « API dans le site » |

```
mon-projet/
└── frontend/   le site ET l'API (sous /api)
```

- Un seul dossier, un seul `npm run dev`, une seule adresse : le site sur http://localhost:3000, l'API sur http://localhost:3000/api.
- Pas de CORS à régler, pas d'adresse d'API à donner au site : `api.get('/products')` appelle `/api/products`.
- Le build (`B`) produit **un serveur Node.js** qui sert le site et l'API : il faut un **hébergement Node.js**
  (le site ne peut plus être purement statique). Les pages restent pré-rendues ; seule l'API répond à chaque requête.
- Mêmes contrôleurs et helpers que les autres back ends JavaScript, MySQL ou SQLite.

**Quoi choisir ?**

- Tu débutes, tu veux un seul projet à lancer et à mettre en ligne, et tu as (ou prendras) un hébergement Node.js :
  **API dans le site**.
- Tu veux une API en PHP, un site statique hébergé gratuitement, ou une API utilisée aussi par une application mobile :
  **API séparée**.
- Nitro avec un autre front que Nuxt reste une API séparée dans `backend/`.

## Quand Docker est utilisé

Docker n'est ajouté que si le projet en a besoin :

| Besoin | Service Docker |
| ------ | -------------- |
| Back end PHP | `backend` : PHP + Apache (image `php:<version>-apache`) |
| Base MySQL | `db` : MySQL (dernière LTS) et `phpmyadmin` |
| Front HTML/CSS/JS | `frontend` : nginx, qui sert le site sans compilation |

Un front JavaScript avec une API JavaScript en SQLite tourne **entièrement sans Docker**.

Versions actuelles des images : PHP **8.5**, MySQL **9.7** (`stacks/infra/versions.json`, mises à jour par le robot
quand tous les back ends PHP marchent avec la nouvelle version).
