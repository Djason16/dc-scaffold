<p align="center">
  <img src="assets/readme/banner.png" alt="DC Scaffold — Créateur de projets web · Web project creator" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/VERSION-1.2.0-4084ff?style=for-the-badge&labelColor=09090b" alt="Version 1.2.0">
  <img src="https://img.shields.io/badge/WINDOWS-10%20%7C%2011-8b5cf6?style=for-the-badge&labelColor=09090b" alt="Windows 10 | 11">
  <img src="https://img.shields.io/badge/LICENSE-ALL%20RIGHTS%20RESERVED-ec4899?style=for-the-badge&labelColor=09090b" alt="License">
</p>

<p align="center">
  <a href="#français"><b>FRANÇAIS</b></a> &nbsp;&nbsp;·&nbsp;&nbsp; <a href="#english"><b>ENGLISH</b></a> &nbsp;&nbsp;·&nbsp;&nbsp; <a href="docs/README.md"><b>DOCUMENTATION</b></a>
</p>

<img src="assets/readme/line.png" width="100%" alt="">

## Français

**DC Scaffold** crée un projet web complet en quelques minutes. Tu choisis un **front** (le site que voient les
visiteurs) et un **back end** (l'API qui garde les données) ; DC Scaffold installe ce qui manque sur l'ordinateur,
crée le projet, le relie et t'explique chaque fichier dans le `README.md` du projet. Pas besoin d'être expert.

<table>
  <tr>
    <td width="50%"><img src="assets/readme/window.png" alt="La fenêtre de DC Scaffold"></td>
    <td width="50%"><img src="assets/readme/creation.png" alt="La création en direct"></td>
  </tr>
  <tr>
    <td width="50%"><img src="assets/readme/site.png" alt="La page d'accueil d'un projet créé"></td>
    <td width="50%"><img src="assets/readme/error.png" alt="La page 404 d'un projet créé"></td>
  </tr>
</table>

<sub>La fenêtre de DC Scaffold, la création suivie en direct, puis l'accueil et la page 404 d'un site créé.</sub>

### Démarrer

1. Télécharge **[`DCScaffold-Setup.exe`](DCScaffold-Setup.exe)** (ou l'onglet *Releases*) et lance-le : installation
   pour ton compte, sans droits administrateur.
2. Ouvre **DC Scaffold** : un nom, un front, un back end, les options… et la création se suit en direct.
   Les outils qui manquent (Node.js, Docker, Git, VS Code…) sont proposés à l'installation.
3. Dans le projet : **`start.bat`** puis **`D`** pour lancer le site et l'API.
4. Pour mettre en ligne : la section **« Mettre en ligne »** du `README.md` du projet donne les étapes, dans l'ordre.

En console : `dcscaffold -Name "Boutique" -Front nuxt -Back slim -Database mysql`
(toutes les options : [Créer un projet](docs/02-creer-un-projet.md)).

### Ce que DC Scaffold crée

| Fronts | Back ends |
| ------ | --------- |
| Nuxt · Next.js · SvelteKit · Qwik · Astro | Slim 4 · Laravel · Symfony · PHP sans framework |
| Vue · React · Svelte · SolidJS (Vite) · Angular | Nitro · Express · NestJS · AdonisJS |
| HTML / CSS / JS · Aucun (API seule) | API dans le site · Aucun (site statique) |

Bases de données : **MySQL** (dans Docker, avec phpMyAdmin) ou **SQLite** (un simple fichier) pour les back ends JavaScript.

Deux façons de ranger l'API, choisies selon le couple :

- **API séparée** (`backend/`) : le site reste statique, l'API s'envoie à part (PHP ou Node.js).
- **API dans le site** (Nuxt + Nitro, Next.js, SvelteKit, Astro, Qwik) : l'API vit dans le serveur du front, un seul dossier,
  un seul serveur, l'API sous `/api`.

Lequel choisir : [Choisir front et back end](docs/03-choisir-front-et-back.md).

### Points forts

- **La même architecture partout** : mêmes helpers, même format JSON, **routes automatiques**
  (`getAll()` dans `ProductsController` → `GET /products`), mêmes dossiers dans chaque front
- **Un site prêt** : AppShell, bandeau cookies, page 404, SEO, `sitemap.xml`, une ou deux langues, design de DC Scaffold
  ou page blanche
- **Tout s'installe selon tes choix** (via winget, après accord), Docker seulement si le projet en a besoin
- **Versions testées chaque semaine** par un robot ; les stacks à jour arrivent tout seuls, sans réinstaller
- **Un README par projet**, dans ta langue, avec ses chemins, ses commandes et ses étapes de mise en ligne ; le code est
  commenté en français ou en anglais
- **Extensible** : chaque front et back end est un dossier avec son `stack.json`

### Documentation

Tout est expliqué dans **[`docs/`](docs/README.md)** :

| Utiliser | Modifier DC Scaffold |
| -------- | -------------------- |
| [Installation](docs/01-installation.md) | [Ajouter un stack](docs/10-ajouter-un-stack.md) |
| [Créer un projet](docs/02-creer-un-projet.md) | [Robot et catalogue](docs/11-robot-et-catalogue.md) |
| [Choisir front et back end](docs/03-choisir-front-et-back.md) | [Développer DC Scaffold](docs/12-developper-dc-scaffold.md) |
| [Le projet créé](docs/04-projet-cree.md) | [Changements par version](CHANGELOG.md) |
| [Le site](docs/05-le-site.md) · [L'API](docs/06-l-api.md) · [Base de données](docs/07-base-de-donnees.md) | |
| [Mettre en ligne](docs/08-mise-en-ligne.md) · [Dépannage](docs/09-depannage.md) · [Lexique](docs/lexique.md) | |

### Feuille de route

- Signature de l'exe (plus d'avertissement SmartScreen)
- Versions macOS et Linux de la fenêtre
- Nouveaux stacks (Django, FastAPI, Hono...)

### Licence

Tous droits réservés © 2026 Djason CHERY — voir [`LICENSE`](LICENSE).

<img src="assets/readme/line.png" width="100%" alt="">

## English

**DC Scaffold** creates a complete web project in minutes. Pick a **front** (the site visitors see) and a **back end**
(the API that keeps the data); DC Scaffold installs what the computer is missing, creates the project, connects
everything and explains every file in the `README.md` of the project. No need to be an expert.

### Getting started

1. Download **[`DCScaffold-Setup.exe`](DCScaffold-Setup.exe)** (or the *Releases* tab) and run it: installed for your
   account, no administrator rights.
2. Open **DC Scaffold**: a name, a front, a back end, the options… and the creation is followed live. Missing tools
   (Node.js, Docker, Git, VS Code…) are offered for installation.
3. In the project: **`start.bat`** then **`D`** to start the site and the API.
4. To go online: the **"Going online"** section of the project's `README.md` gives the steps, in order.

In a console: `dcscaffold -Name "Shop" -Front nuxt -Back slim -Database mysql`.

### What DC Scaffold creates

| Fronts | Back ends |
| ------ | --------- |
| Nuxt · Next.js · SvelteKit · Qwik · Astro | Slim 4 · Laravel · Symfony · PHP without framework |
| Vue · React · Svelte · SolidJS (Vite) · Angular | Nitro · Express · NestJS · AdonisJS |
| HTML / CSS / JS · None (API only) | API inside the site · None (static site) |

Databases: **MySQL** (in Docker, with phpMyAdmin), or **SQLite** (a plain file) for the JavaScript back ends.

Two ways to place the API, picked for the chosen pair:

- **Separate API** (`backend/`): the site stays static, the API is uploaded on its own (PHP or Node.js).
- **API inside the site** (Nuxt + Nitro, Next.js, SvelteKit, Astro, Qwik): the API lives in the server of the front, one folder,
  one server, the API under `/api`.

### Highlights

- **The same architecture everywhere**: same helpers, same JSON format, **automatic routes**
  (`getAll()` in `ProductsController` → `GET /products`), same folders in every front
- **A ready site**: AppShell, cookie banner, 404 page, SEO, `sitemap.xml`, one or two languages, DC Scaffold design or blank page
- **Everything installed for your choices** (through winget, after asking), Docker only when the project needs it
- **Versions tested every week** by a robot; updated stacks arrive by themselves, without reinstalling
- **One README per project**, in your language, with its paths, commands and going-online steps; code commented in French or English
- **Extensible**: every front and back end is a folder with its `stack.json`

### Documentation

The full documentation is in **[`docs/`](docs/README.md)** (in French). In English: the
[stack guide](stacks/README.en.md), the [installer](installer/README.md), the [window](launcher/README.md) and the
[changelog](CHANGELOG.md).

### Roadmap

- Signed exe (no SmartScreen warning)
- macOS and Linux windows
- More stacks (Django, FastAPI, Hono...)

### License

All rights reserved © 2026 Djason CHERY — see [`LICENSE`](LICENSE).
