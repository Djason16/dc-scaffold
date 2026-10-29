# 12. Développer DC Scaffold

[← Sommaire](README.md)

## Le dépôt

```
├── DCScaffold-Setup.exe   installateur Windows (recompilé à chaque version)
├── DCScaffold.bat         lance le moteur de ce dossier sans rien installer (développement)
├── VERSION                numéro de version de l'application, le seul endroit à modifier
├── CHANGELOG.md           ce qui change à chaque version
├── docs/                  cette documentation
├── engine/                moteur PowerShell : dc-scaffold.ps1, lang/fr.json, lang/en.json, banner.txt
├── stacks/                modèles de tous les projets (voir 10. Ajouter un stack), version dans stacks/version.txt
├── tools/robot/           robot de compatibilité (voir 11. Robot et catalogue)
├── tools/stacks/          scripts qui écrivent certains stack.json (site_stack.py : le back end « API dans le site »)
├── launcher/              code Go de DCScaffold.exe : la fenêtre (ui/), le serveur local, les mises à jour
├── installer/             installateur NSIS : dc-scaffold.nsi, images, build.sh, build.ps1, build-docker.ps1
├── assets/                logo, icône, images du README
└── .github/workflows/     build.yml (setup), compatibility.yml (robot)
```

## Le moteur (`engine/dc-scaffold.ps1`)

Un script PowerShell (7 ou Windows PowerShell 5.1) qui **ne connaît aucun framework** : il lit les `stack.json` et
exécute leurs étapes. Ses grandes parties, dans l'ordre :

1. **Configuration** : questions (ou options), choix du front et du back end, base, langues, ports. Un back end avec
   `inside` pour ce front est rangé dans le front (`$BackInside`).
2. **Outils** : `Test-Tools` vérifie Node.js, Git, Docker, PHP, Composer, VS Code et les installe avec winget.
3. **Versions** : `Resolve-Version` lit npm / Packagist pour chaque `versions`.
4. **Jetons** : `$Tokens` (ports, noms, versions, chemins du guide, étapes « Mettre en ligne »...), puis le README du projet
   assemblé depuis `stacks/shared/docs` (readme, guides front et back, `doc.md` des stacks).
5. **Fichiers communs**, `docker-compose.yml` assemblé depuis `stacks/infra/docker`.
6. **API** (`Invoke-StackSteps` dans `backend/`), puis **Front** (dans `frontend/`, et les étapes `inside` après).
7. **Dépendances** (`start.ps1 -Action I`), **Git**.

`Write-ProjectFile` écrit chaque fichier : blocs une / deux langues, commentaires traduits (`Convert-Comments`), textes
écrits dans les composants (une langue), jetons, fins de ligne Windows pour `.ps1` / `.bat`.

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
- `catalog.go` : téléchargement du catalogue de stacks.

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
| La fenêtre | `go run .` dans `launcher/`, ou recompiler le setup |
| Le robot | `python3 tools/robot/robot.py plan`, et un `test` sous Linux / WSL |

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

## Publier une version

1. Mets à jour `VERSION`, le badge de version du `README.md` et `CHANGELOG.md`.
2. Recompile et teste le setup en local.
3. Commite et pousse (le robot republie le catalogue avec `minApp` = cette version).
4. Crée le tag et pousse-le :
   ```
   git tag v1.2.0
   git push --tags
   ```
   Le workflow `build.yml` compile le setup et le publie dans *Releases* : les DC Scaffold installés le proposent en mise à jour.

Si la version change le moteur et que des corrections de stacks doivent aussi arriver chez les utilisateurs de
l'ancienne version, pousse ces corrections **avant** de changer `VERSION` (voir [11. Robot et catalogue](11-robot-et-catalogue.md)).
