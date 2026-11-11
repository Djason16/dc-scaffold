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
| HTML / CSS / JS | rien à compiler : `B` écrit seulement `sitemap.xml` et `robots.txt`, puis `frontend/` tel quel | — |

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
| Slim 4 | Envoie `backend/` (avec `vendor/` et `.env.production`, **sans le `.env`**) sur un hébergement PHP 8.5+ ; l'adresse de l'API pointe sur le dossier `backend/` envoyé |
| Laravel | Envoie `backend/` (avec `vendor/`, **sans le `.env`** du dev) sur un hébergement PHP 8.5+, avec `.env.production` renommé `.env` (Laravel ne lit que lui) ; l'adresse de l'API pointe sur le dossier `backend/` envoyé |
| Symfony | Pareil, **sans le `.env.local`** (les réglages du dev) : en ligne, `.env` lance le mode `prod`, qui lit `backend/.env.prod.local` |
| PHP | Envoie `backend/` (avec `.env.production`, **sans le `.env`**) sur un hébergement PHP 8.5+ ; l'adresse pointe sur le dossier `backend/` envoyé (sans Composer) |
| Nitro | `start.bat` puis `A` (compilation dans `backend/.output`), envoie `backend/` sur un hébergement Node.js 22.13+ et lance `npm start` |
| Express | Envoie `backend/` sur un hébergement Node.js 22.13+, puis `npm install --omit=dev` et `npm start` |
| NestJS | `start.bat` puis `A` (compilation dans `backend/dist`), envoie `backend/`, puis `npm install --omit=dev` et `npm start` |
| AdonisJS | `start.bat` puis `A` (compilation dans `backend/build`), envoie `backend/build/` avec `.env.production` renommé `.env`, puis `npm ci --omit=dev` et `node bin/server.js` (Node.js 24+) |

« L'adresse de l'API pointe sur le dossier `backend/` envoyé » : chez l'hébergeur, le domaine (ou sous-domaine) de l'API a
pour dossier racine **le dossier de l'API lui-même** (là où sont `public/`, `src/`, `uploads/`), **pas `public/`**. Le
`.htaccess` à la racine de `backend/` fait le tri : toute adresse va vers `public/index.php`, sauf `/uploads/...`, servi tel
quel (les fichiers envoyés depuis l'admin, sans jamais exécuter de PHP). Le code, `vendor/` et `.env.production` ne sont donc
jamais lisibles depuis le web. Avec `public/` comme dossier racine, ce `.htaccess` serait ignoré et les fichiers de
`uploads/` (à côté de `public/`) ne s'afficheraient plus. Pense à envoyer le `.htaccess` : c'est un fichier caché.

**Slim et PHP : rien à régler sur le serveur.** Leurs réglages sont lus par `config/env.php` : le `.env` s'il existe
(sur ton ordinateur), sinon le `.env.production`. Il suffit donc de **ne pas envoyer le `.env`** : en ligne, l'API lit
`.env.production` toute seule (pas de `SetEnv APP_ENV` à changer dans un `.htaccess`).

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

### Hébergement qui charge un fichier (cPanel « Setup Node.js App », o2switch)

Certains hébergements ne lancent pas `npm start` : ils chargent un fichier (Passenger sur cPanel). Chaque projet avec
un serveur Node.js (site + API dans le site, Nitro, Express, NestJS, AdonisJS) a pour ça un **`server.cjs`** à côté de son
`package.json` :

- dans *Setup Node.js App*, mets **Application startup file** = `server.cjs` (pas de port à choisir, l'hébergement le donne) ;
- `server.cjs` lit la commande `start` de `package.json` et la lance : les réglages de `--env-file` (sinon
  `.env.production`), les modules de `--import`, puis le fichier du serveur. Rien à modifier d'un stack à l'autre ;
- en qualif, il rend au site le dossier de son adresse quand l'hébergement l'enlève ;
- ce qui se passe est écrit dans `.startup.log`, à côté de lui ;
- il est en CommonJS (`.cjs`) exprès : un `.mjs` ne démarre pas avec Passenger.

Ailleurs (Infomaniak, un VPS), `npm start` suffit et `server.cjs` est ignoré. AdonisJS : `npm run build` le copie
dans `build/`.

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

## La qualif (avant la mise en ligne)

### Qu'est-ce que c'est ?

La **qualif** (ou pré-production) est une copie du site **montrée au client avant la mise en ligne**, pour qu'il le
regarde, le teste et le valide. Elle tourne sur ton hébergement, pas sur ton ordinateur :

| | Dev | Qualif | Production |
| - | --- | ------ | ---------- |
| Pour qui | toi | le client (et toi) | tout le monde |
| Où | ton ordinateur (`localhost`) | ton hébergement, dans un dossier protégé par mot de passe | l'adresse du site |
| Réglages | `.env` | **`.env.preprod`** | `.env.production` |
| Commande | `start.bat` puis `D` | **`start.bat` puis `Q`** | `start.bat` puis `G` ou `B` |
| Données | base locale | **sa propre base** (jamais celle de production) | base en ligne |
| Google | - | jamais indexée | indexée |

Une seule adresse sert à toutes les qualifs, **un dossier par site** : `https://qualifs.example.com/mon-site/` (et
`https://qualifs.example.com/mon-site-api/` pour une API séparée). **Le code est le même qu'en production** : seuls
les réglages changent, donc ce que le client valide est exactement ce qui partira en ligne.

Disponible pour **tous les fronts** (statiques ou serveur Node.js) et **toutes les API** (PHP et Node.js).

### Une seule fois : le dossier des qualifs sur l'hébergement

1. **Une adresse** pour les qualifs : un sous-domaine d'un domaine à toi (`qualifs.mon-domaine.fr`), avec son
   certificat https. Sur cPanel : *Domaines* (dossier `qualifs/`), puis *Let's Encrypt* ou *AutoSSL*.
2. **Un mot de passe** sur ce dossier : cPanel, *Confidentialité du répertoire*, dossier `qualifs/`, un utilisateur.
   Il protège toutes les qualifs d'un coup (les sous-dossiers suivent). Donne-le au client avec l'adresse de son site.

### Pour chaque site

1. **Réglages du site** : `frontend/.env.preprod` (créé avec le projet). Il a **les mêmes lignes** que
   `.env.production`, seules les adresses changent. Avec Nuxt par exemple :
   ```
   NUXT_PUBLIC_SITE_NAME="Mon site"
   NUXT_PUBLIC_SITE_URL=https://qualifs.example.com/mon-site
   NUXT_PUBLIC_BACKEND_DOMAIN=https://qualifs.example.com/mon-site-api    (API séparée seulement)
   ```
   Les autres fronts ont leurs propres noms (`VITE_SITE_URL`, `PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_URL`...) : ce sont
   ceux de leur `.env.production`. Le dossier du site (`/mon-site/`) est lu dans l'adresse : rien d'autre à régler.
2. **Réglages de l'API** : le `.env.preprod` de l'API, les mêmes lignes que son `.env.production` avec **une base de
   données à part** et les adresses de qualif :
   - `API_BASE_URL` (ou `APP_URL`) : `https://qualifs.example.com/mon-site-api` ;
   - `APP_BASE_URL`, l'origine autorisée à appeler l'API : **le domaine seul**, `https://qualifs.example.com`.

   API dans le site : la base de la qualif va dans le même `frontend/.env.preprod`.

   **Les secrets de la qualif sont les siens**, jamais ceux de la production : secret de session ou de chiffrement
   (`SESSION_SECRET`, `APP_SECRET`, `APP_KEY`), mot de passe de l'admin de départ. Avec le même secret, un cookie de
   connexion de la qualif serait valable en production. Nouveau secret :
   `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. Clés de paiement et d'envoi : celles
   de test.
3. **Préparer** : `start.bat` puis **`Q`**. Le site est construit avec `.env.preprod` et tout est rangé dans
   `qualif/` à la racine du projet :
   - `qualif/mon-site/` : le site statique, ou le serveur Node.js du site (avec `.env.preprod` devenu son
     `.env.production`) ;
   - `qualif/mon-site-api/` : l'API séparée, avec `.env.preprod` sous le nom qu'elle lit en ligne (`.env.production`,
     `.env.prod.local` pour Symfony, `.env` pour Laravel et AdonisJS).
4. **Envoyer** : le contenu de `qualif/` dans le dossier `qualifs/` de l'hébergement.
   - Base de données : crée la base de la qualif et importe les tables avec des **données génériques** (produits,
     textes et comptes d'exemple, comme ta base locale de test), **jamais une copie de la production** : pas de vrais
     clients, commandes ni comptes. Photos et fichiers d'exemple aussi, jamais le `uploads/` de la production.
   - Serveur Node.js (site ou API) : sur cPanel, *Setup Node.js App* avec l'adresse `qualifs.example.com/mon-site` (ou
     `mon-site-api`), son dossier et **`server.cjs`** comme fichier de démarrage (copié dans `qualif/` par `Q`), puis
     `npm install --omit=dev` si les modules ne sont pas envoyés (inutile pour Nuxt : `.output/` les contient).
5. **Envoyer l'adresse au client** : `https://qualifs.example.com/mon-site/`, avec l'identifiant et le mot de passe.

Après une correction : `Q` à nouveau et renvoyer `qualif/`. Le jour de la mise en ligne, rien à changer : la
production se construit toujours avec `.env.production` (`G` ou `B`).

### Ce que fait DC Scaffold pour toi

Un site est fait pour vivre à la racine de son adresse (`https://example.com/`). En qualif, il vit dans un dossier.
La commande de qualif (`scripts/qualif.mjs`, lancée par `Q` ou `npm run build:qualif` / `generate:qualif` avec Nuxt) :

- lit le dossier dans l'adresse du site de `.env.preprod` et le donne au front comme base du site (`base` de Vite et
  d'Astro, `basePath` de Next, `paths.base` de SvelteKit, `--base-href` d'Angular, base du routeur) : les pages, les
  liens et les scripts suivent ;
- ramène dans le dossier ce qui est encore écrit depuis la racine dans le code : les fichiers de `public/`
  (`"/images/logo.png"` devient `"/mon-site/images/logo.png"`) et les liens des pages (`"/contact/"`). Avec l'API dans
  le site (Nuxt + Nitro), c'est `server/plugins/qualif.ts` qui le fait pour chaque page ;
- écrit le `.htaccess` de qualif (les règles de production, tournées vers le dossier, et l'en-tête `noindex`) et un
  `robots.txt` qui interdit tout : la qualif n'est jamais indexée ;
- site sans build (HTML / CSS / JS) : met l'adresse de l'API de la qualif dans `js/config.js`.
- serveur Node.js de Next, SvelteKit, Astro ou Qwik (Nuxt a déjà son plugin) : ajoute un module
  `qualif-html.mjs` chargé par `npm start`, qui ramène dans le dossier les liens des pages au moment où le serveur les
  envoie et ajoute l'en-tête `noindex` ; le dossier est aussi écrit dans le `.env.production` de la qualif
  (`QUALIF_BASE_PATH`), pour les serveurs qui relisent leurs réglages au démarrage (`next start`) ;
- API dans le site : elle est appelée dans le dossier (`/mon-site/api/...`), sur le serveur comme dans le navigateur, et
  les adresses écrites depuis la racine qui arrivent avec les données (photos envoyées, `/uploads/...`) sont ramenées
  dans le dossier dans le navigateur aussi (Nuxt : `plugins/qualif.client.js`, les autres : `scripts/qualif-html.mjs`).

Pour l'API séparée, **son code ne change pas** : `Q` lui ajoute un petit fichier d'entrée qui retire le dossier de
l'adresse avant qu'elle la voie (ses routes restent `/api/...`) :

- API PHP (Slim, Laravel, Symfony, PHP) : un `public/index.php` de qualif qui appelle le vrai (renommé
  `index.api.php`), ses `.htaccess` adaptés au dossier, et une règle qui refuse les réglages (`.env*`),
  `composer.json` et les outils : seuls `public/` et `uploads/` sont servis ;
- API Node.js (Express, NestJS, AdonisJS, Nitro) : un module `qualif-base.mjs` chargé par `npm start` ; NestJS,
  AdonisJS et Nitro sont compilés avant.

**Le dev et la production n'en voient rien** : à la racine de leur adresse, tout cela ne change rien.

### Avant d'envoyer la qualif : la liste

- [ ] `frontend/.env.preprod` : l'adresse de qualif du site (avec son dossier), et celle de l'API si elle est séparée
- [ ] `.env.preprod` de l'API : **la base de la qualif**, jamais celle de production ; son adresse de qualif ; le
      domaine seul dans `APP_BASE_URL`
- [ ] Les secrets de la qualif sont les siens (session, admin), les clés de paiement sont celles de test
- [ ] La base de la qualif existe sur l'hébergement, avec ses tables et des données génériques (jamais celles de la production)
- [ ] `start.bat` puis `Q` refait **après** avoir modifié `.env.preprod`
- [ ] Le dossier `qualifs/` est protégé par mot de passe et en https
