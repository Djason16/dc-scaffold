# 4. Le projet créé

[← Sommaire](README.md)

## Les dossiers

### Avec une API séparée

```
mon-projet/
├── backend/             l'API : contrôleurs, helpers, routes automatiques, .env
├── frontend/            le site : pages, composants, styles, client api.js, .env
├── mysql/               configuration de MySQL (si base MySQL) : my.cnf, init/ (scripts SQL), logs/
├── database/            les données de MySQL (créé au premier démarrage, pas dans Git)
├── docker-compose.yml   seulement les services utiles (PHP, MySQL, phpMyAdmin, nginx)
├── scripts/             fonctions de start.ps1
├── start.bat            le menu du projet (voir plus bas)
├── start.ps1            le même menu, en PowerShell
├── .vscode/             extensions conseillées par VS Code à l'ouverture
├── .gitignore           node_modules, vendor, builds, .env, bases de données...
└── README.md            le guide du projet, dans ta langue
```

### Avec l'API dans le site

```
mon-projet/
├── frontend/            le site ET l'API (frontend/server/, src/lib/server/ ou src/server/ selon le front)
├── mysql/, docker-compose.yml   seulement avec MySQL
├── start.bat, start.ps1, scripts/
└── README.md
```

Il n'y a pas de dossier `backend/`.

## `start.bat` : le menu du projet

Double-clique sur `start.bat` (ou `.\start.ps1` dans PowerShell). Le menu ne montre que **ce qui existe dans ce projet**.

| Touche | Quand | Ce que ça fait |
| ------ | ----- | -------------- |
| `D` Développement | toujours | Installe ce qui manque, puis ouvre une fenêtre par programme : Docker (`docker compose up`), l'API (`npm run dev` dans `backend/`), le site (`npm run dev` dans `frontend/`). Affiche les adresses |
| `S` Arrêter | avec Docker | `docker compose down` : arrête PHP, MySQL, phpMyAdmin, nginx |
| `R` Reconstruire | avec Docker | Reconstruit les images Docker sans cache (après un changement du `Dockerfile` ou de `php.ini`) |
| `I` Installer | toujours | `composer install` et `npm install` dans chaque dossier : après un `git clone`, ou après avoir ajouté un paquet dans `package.json` / `composer.json` |
| `G` Générer | Nuxt sans API dans le site | Site statique dans `frontend/.output/public`, avec `.env.production` |
| `B` Build | les autres fronts à compiler | Site statique à envoyer (avec `.env.production`) ; ou, avec l'API dans le site, **site + API dans un serveur Node.js** |
| `A` Build API | API séparée qui se compile (Nitro, NestJS, AdonisJS) | `npm run build` dans `backend/` |

**Un seul choix de production est proposé**, celui qui convient au projet : `G` ou `B`, jamais les deux.

Sous le menu, **« En ligne »** rappelle les étapes de mise en ligne de ce projet (détail : [8. Mettre en ligne](08-mise-en-ligne.md)).

En ligne de commande : `.\start.ps1 -Action D` (ou `S`, `R`, `I`, `G`, `B`, `A`).

## Les adresses en développement

| Service | Adresse par défaut |
| ------- | ------------------ |
| Site | http://localhost:3000 (Nuxt, Next.js), 5173 (Vite, SvelteKit, Qwik), 4200 (Angular), 4321 (Astro), 8080 (HTML/CSS/JS) |
| API séparée | http://localhost:8000 |
| API dans le site | l'adresse du site + `/api` (par exemple http://localhost:3000/api) |
| phpMyAdmin | http://localhost:8081 (identifiant `root`, mot de passe dans le `.env` de l'API) |
| MySQL (back ends JavaScript) | `localhost:3306` |

Les ports se changent à la création (options de la fenêtre, ou `-AppPort`, `-ApiPort`, `-PmaPort`, `-DbPort`).

## Les fichiers `.env`

Les réglages et les mots de passe sont dans des fichiers `.env`, **jamais envoyés sur Git** (seuls les `.env.example` le sont) :

| Fichier | Rôle |
| ------- | ---- |
| `.env` | Développement, sur ton ordinateur |
| `.env.production` | En ligne : utilisé par le build du site (`B` / `G`) et par `npm start` des serveurs Node.js |
| `.env.example` | Modèle sans mot de passe, sur Git : la liste des réglages à remplir |

Dans `frontend/` : le nom et l'adresse du site (`*_SITE_NAME`, `*_SITE_URL`) et, avec une API séparée, l'adresse de l'API
(`VITE_API_URL`, `NUXT_PUBLIC_BACKEND_DOMAIN`, `NEXT_PUBLIC_API_URL`, `PUBLIC_API_URL`, `API_URL` selon le front ;
`frontend/js/config.js` pour HTML/CSS/JS).

Dans `backend/` (ou `frontend/` avec l'API dans le site) : `APP_ENV`, `APP_NAME`, la base (`DB_CONNECTION`, `DB_HOST`,
`DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_FILE` pour SQLite) et, avec une API séparée, `APP_BASE_URL`
(l'adresse du site autorisée à appeler l'API).

Le mot de passe MySQL est généré au hasard à la création et écrit dans le `.env` de l'API.

## Le `README.md` du projet

Un seul fichier, dans la langue choisie au départ, écrit pour **ce** projet (ses chemins, ses commandes) :

- **Démarrer** : `start.bat`, les adresses
- **Le site** : design, couleurs, polices, textes, langues, cookies, nouvelle page, SEO, AppShell, bon à savoir sur le framework
- **L'API** : où sont les choses, nouvelle route, exemple complet de contrôleur, requête et réponse, base de données, CORS, lancer
- **Mettre en ligne** : les étapes dans l'ordre
- **Fichiers d'environnement**, **Petit lexique**

## Les commentaires du code

Les commentaires du code généré sont **dans la langue choisie** (français ou anglais), comme le README.

## Git

Avec Git, le projet est créé avec un premier commit (`🎉 init: scaffold ...`). Si Git ne connaît pas encore ton nom et
ton e-mail, le dépôt est créé sans commit : `git config --global user.name "Ton nom"` puis
`git config --global user.email "toi@exemple.fr"`, et fais le premier commit toi-même.
