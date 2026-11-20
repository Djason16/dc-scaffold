# 12. Développer DC Scaffold

[← Sommaire](README.md)

## Le dépôt

```
├── DCScaffold-Setup.exe   installateur Windows (recompilé à chaque version)
├── DCScaffold.bat         lance le moteur de ce dossier sans rien installer (développement)
├── VERSION                numéro de version de l'application, le seul endroit à modifier
├── CHANGELOG.md           ce qui change à chaque version
├── docs/                  cette documentation
├── engine/                moteur PowerShell : dc-scaffold.ps1, unix.ps1 (macOS, Linux), lang/fr.json, lang/en.json, banner.txt
├── stacks/                modèles de tous les projets (voir 10. Ajouter un stack), version dans stacks/version.txt
├── tools/robot/           robot de compatibilité (voir 11. Robot et catalogue)
├── tools/check/           contrôle qualité : zéro erreur et zéro avertissement dans un projet tout juste créé (voir plus bas)
├── tools/stacks/          scripts qui écrivent certains stack.json (site_stack.py : le back end « API dans le site »)
├── launcher/              code Go de DCScaffold.exe (et de l'app macOS / Linux) : la fenêtre (ui/), le serveur local, les mises à jour
├── installer/             installateur NSIS : dc-scaffold.nsi, images, build.sh, build.ps1, build-docker.ps1 ;
│                          macOS : build-mac.sh, mac/Info.plist ; Linux : build-linux.sh, linux/install.sh, linux/uninstall.sh
├── assets/                logo, icône, images du README
└── .github/workflows/     release.yml (Windows, macOS, Linux), compatibility.yml (robot)
```

## Le moteur (`engine/dc-scaffold.ps1`)

Un script PowerShell (7 ou Windows PowerShell 5.1) qui **ne connaît aucun framework** : il lit les `stack.json` et
exécute leurs étapes. Ses grandes parties, dans l'ordre :

1. **Configuration** : questions (ou options), choix du front et du back end, base, langues, ports. Un back end avec
   `inside` pour ce front est rangé dans le front (`$BackInside`).
2. **Outils** : `Test-Tools` vérifie Node.js, Git, Docker, PHP, Composer, VS Code et les installe avec winget ; sous
   macOS et Linux (`$OnUnix`), `engine/unix.ps1` prend le relais (Homebrew, `~/.local`, commandes à taper).
3. **Versions** : `Resolve-Version` lit npm / Packagist pour chaque `versions`.
4. **Jetons** : `$Tokens` (ports, noms, versions, chemins du guide, étapes « Mettre en ligne »...), puis le README du projet
   assemblé depuis `stacks/shared/docs` (readme, guides front et back, `doc.md` des stacks).
5. **Fichiers communs**, `docker-compose.yml` assemblé depuis `stacks/infra/docker`.
6. **API** (`Invoke-StackSteps` dans `backend/`), puis **Front** (dans `frontend/`, et les étapes `inside` après).
7. **Dépendances** (`start.ps1 -Action I`), **Git**.

`Write-ProjectFile` écrit chaque fichier : blocs une / deux langues, commentaires traduits (`Convert-Comments`), textes
écrits dans les composants (une langue), jetons, fins de ligne Windows pour `.ps1` / `.bat`. `start.sh` (menu macOS / Linux)
est rendu exécutable, aussi dans Git (`git update-index --chmod=+x`), même pour un projet créé sous Windows.

Lancé par la fenêtre avec `-Ui`, il envoie sa progression en lignes `##DCS {json}` (`step`, `root`, `question`, `done`).

Les messages du moteur sont dans `engine/lang/fr.json` et `engine/lang/en.json` (`T 'clé' arg1 arg2`).

## La fenêtre (`launcher/`)

Un programme Go :

- `main.go` démarre un petit serveur web sur `127.0.0.1` (port et jeton aléatoires) et l'ouvre dans **Edge en mode
  application** ;
- `ui/` (intégré à l'exe) : `index.html`, `app.css`, `app.js`, polices, images : les cinq étapes, en français et en anglais ;
- `app.go` : les appels `/api/...` de la fenêtre ; `stacks.go` lit les `stack.json` (seulement les champs utiles à l'affichage) ;
- `job.go` lance `engine\dc-scaffold.ps1 -Ui` et transmet sa sortie en direct ; les questions passent par des fichiers réponses ;
- `update.go` : dernière release GitHub et bouton « Mettre à jour » ;
- `catalog.go` : téléchargement du catalogue de stacks ;
- `platform_windows.go` (Edge, sélecteur de dossier, consoles) ; `platform_unix.go`, `platform_darwin.go`,
  `platform_xdg.go` (Linux) : navigateur Chromium en mode application, `osascript` / `zenity` / `kdialog`, Terminal ou le
  terminal du bureau, PowerShell 7, PATH du terminal ; `update_windows.go` / `update_unix.go` : la mise à jour de chaque système ;
  `paths.go` : dossiers des réglages (`~/Library/Application Support/DC Scaffold`, `~/.config/dc-scaffold`).

Développer la fenêtre sans installer :

```
cd launcher
$env:DCS_ROOT = '..'; go run . --no-update
```

Options de `DCScaffold.exe` : `--console` (moteur dans une console), `--no-update`, `--no-window` (affiche l'adresse).

## Tester une modification

| Ce que tu modifies | Comment tester |
| ------------------ | -------------- |
| Un stack, la doc d'un projet, `start.ps1` | `.\DCScaffold.bat -Lang fr -Name test -Front ... -Back ... -SkipToolCheck -NoGit -Force`, puis build et `start.bat` dans le projet |
| Le moteur | Pareil, avec plusieurs couples (API séparée, API dans le site, sans API, sans front) |
| Avant une version | `node tools/check/check.mjs` : zéro erreur et zéro avertissement partout (voir Contrôle qualité) |
| La fenêtre | `go run .` dans `launcher/`, ou recompiler le setup ; `GOOS=darwin` / `GOOS=linux go vet ./...` pour les autres systèmes |
| macOS, Linux | `pwsh engine/dc-scaffold.ps1 -Lang fr -Name test -Front ... -Back ... -SkipToolCheck -NoGit -Force` (le robot fait la même chose sous Linux), puis `./start.sh` dans le projet |
| Le robot | `python3 tools/robot/robot.py plan`, et un `test` sous Linux / WSL |

## Contrôle qualité (`tools/check/`)

Un projet tout juste créé doit avoir **zéro erreur et zéro avertissement**, quel que soit le couple choisi.
`tools/check/check.mjs` le vérifie : il crée des projets avec le moteur (dans `%TEMP%\dcs-check`, hors de `Coding`), puis,
pour chacun :

| Étape | Ce qui est lancé |
| ----- | ---------------- |
| `lint` | `npm run lint` du front et de l'API (ESLint, oxlint ; chaque front et back end Node.js en a un) ; `node --check` des scripts du front HTML / CSS / JS ; `php -l` de chaque fichier d'une API PHP |
| `types` | `npm run typecheck`, `type-check` ou `check` (vue-tsc, svelte-check, astro check, nuxt typecheck) ; sinon `tsc --noEmit` après le build |
| `build` | le build mis en ligne (`build:prod` / `generate:prod` de Nuxt, sinon `build`), plus `artisan about` (Laravel) et `lint:container` (Symfony) |
| `start` | `npm run dev` (ou `php -S` pour une API PHP, un petit serveur pour HTML / CSS / JS), l'accueil doit répondre 200 ; ce que les serveurs écrivent pendant la visite compte aussi |
| `console` | Chrome sans écran (protocole DevTools, sans paquet npm) ouvre l'accueil et une page inconnue (404 attendu) : aucun avertissement, aucune erreur, aucune exception |

Chaque front est créé **en TypeScript et en JavaScript** (quand il propose les deux), en **deux langues** (vérifié design
allumé puis éteint, `dc-scaffold.config.js`) et en **une langue avec une API** (dans le site quand le front en a une, sinon
un back end séparé, chacun son tour) ; chaque back end non couvert par un front est aussi créé seul, et les API PHP avec PDO.

```
node tools/check/check.mjs --list                    la liste des cas
node tools/check/check.mjs                           tout (une quarantaine de projets, environ 40 minutes)
node tools/check/check.mjs --only react,none-slim    seulement les cas qui commencent par ces noms
node tools/check/check.mjs --jobs 2 --keep           2 projets à la fois, projets gardés pour les regarder
```

Il faut Node.js, PowerShell 7 (`pwsh`), Chrome (ou `CHROME_PATH`) et PHP / Composer pour les back ends PHP (sans PHP,
ces cas sont sautés et signalés). `--no-console` saute Chrome. Le résultat : un tableau dans la console,
`report.md`, `results.json` et un journal par cas (`<cas>.log`) dans le dossier de travail (`--dir`). Le code de sortie
vaut 1 dès qu'un problème reste.

Les avertissements écrits par les frameworks eux-mêmes, quel que soit le projet (Nuxt et Rolldown, la CLI de Qwik...), ou dus à un ordinateur occupé par plusieurs projets à la fois (« Slow filesystem » de Next.js, `PLUGIN_TIMINGS` de Rolldown),
sont listés à part (« upstream ») et ne comptent pas : la liste `UPSTREAM` de `tools/check/run.mjs` les décrit, à
retirer quand une nouvelle version du framework les corrige.

Si un catalogue téléchargé (`%LOCALAPPDATA%\DC Scaffold\catalog\current`) est plus récent que `stacks/version.txt`, le
moteur l'utiliserait à la place des stacks du dépôt : le script le signale.
## Compiler le setup (`DCScaffold-Setup.exe`)

La version vient de `VERSION`. Le build écrit aussi cette version dans `launcher/resources.rc`, `launcher/app.manifest`
et `launcher/rsrc_windows_amd64.syso` (informations de version de l'exe).

| Méthode | Commande | Il faut |
| ------- | -------- | ------- |
| **Windows, avec Docker** (conseillé) | `.\installer\build-docker.ps1` | Docker Desktop |
| Linux / WSL | `./installer/build.sh` | Go, `nsis`, `mingw-w64` |
| Windows, sans Docker | `.\installer\build.ps1` | Go et un NSIS 3 avec les stubs `amd64-unicode` (le NSIS officiel pour Windows ne les a pas) |
| GitHub | tag `v*` (voir plus bas) | rien |

`build-docker.ps1` fait exactement ce que fait GitHub : `build.sh` dans un conteneur Linux (Go 1.24, NSIS, mingw).
Résultat : `DCScaffold-Setup.exe` à la racine du dépôt.

`UPDATE_REPO` (ou `-UpdateRepo`) : le dépôt GitHub dont les releases sont proposées en mise à jour
(`Djason16/dc-scaffold` par défaut, vide = pas de vérification).

## Compiler pour macOS et Linux

Sous Linux, macOS ou WSL, avec Go seulement (Go compile pour les autres systèmes) ; les fichiers vont dans `dist/` :

| Commande | Résultat |
| -------- | -------- |
| `./installer/build-mac.sh` | `DCScaffold-<version>-mac-arm64.zip` et `-mac-x64.zip` (`DC Scaffold.app`) ; sur un Mac, aussi les `.dmg` (hdiutil) et la signature ad hoc (codesign) |
| `./installer/build-linux.sh` | `DCScaffold-<version>-linux-x64.tar.gz` (`ARCHS="x64 arm64"` : aussi ARM) |

`UPDATE_REPO` comme pour le setup. Sous Windows avec Docker Desktop, dans l'image Go du setup :
`docker run --rm -v "${PWD}:/src" -w /src golang:1.24-bookworm sh -c 'apt-get update -qq && apt-get install -y -qq zip && sh installer/build-mac.sh && sh installer/build-linux.sh'`.

L'app macOS n'est pas signée par un compte Apple (pas de notarisation) : au premier lancement, *Ouvrir quand même*
(voir [1. Installation](01-installation.md)). L'icône `.icns` est faite par `build-mac.sh` depuis `assets/icon-64.png` et
`assets/icon-256.png`.

## Publier une version

1. Mets à jour `VERSION`, `CHANGELOG.md` et le badge de version : `assets/readme/badges/version.svg`, un fichier du dépôt
   (pas un lien vers shields.io : GitHub abandonne une image qui met plus de quelques secondes à arriver, et un badge
   neuf de shields.io peut mettre 3 à 4 secondes). Pour le refaire, remplace `1.3.0` par la nouvelle version :
   ```
   curl -o assets/readme/badges/version.svg "https://img.shields.io/badge/VERSION-1.3.0-4084ff?style=for-the-badge&labelColor=09090b"
   ```
   L'`alt` du badge dans `README.md` (`Version 1.3.0`) change aussi.
2. Recompile et teste le setup en local (et, si possible, les versions macOS et Linux).
3. Commite et pousse (le robot republie le catalogue avec `minApp` = cette version, sans rien commiter lui-même).
4. Crée le tag et pousse-le :
   ```
   git tag v1.3.0
   git push --tags
   ```
   Le workflow `release.yml` compile le setup Windows, les zip et `.dmg` macOS et le `.tar.gz` Linux, crée la release
   avec les notes de cette version du `CHANGELOG.md` et y joint les fichiers : les DC Scaffold installés proposent
   celui de leur système en mise à jour.

Si la version change le moteur et que des corrections de stacks doivent aussi arriver chez les utilisateurs de
l'ancienne version, pousse ces corrections **avant** de changer `VERSION` (voir [11. Robot et catalogue](11-robot-et-catalogue.md)).
