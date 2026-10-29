# Documentation de DC Scaffold

Version **1.2.0**. Cette documentation explique tout DC Scaffold, de l'installation à la mise en ligne d'un projet,
puis le fonctionnement interne pour ceux qui veulent le modifier.

Pas besoin de tout lire : commence par la partie qui te concerne.

## Utiliser DC Scaffold

| Page | Ce qu'on y trouve |
| ---- | ----------------- |
| [1. Installation](01-installation.md) | Installer, mettre à jour, désinstaller ; ce qui est installé sur l'ordinateur |
| [2. Créer un projet](02-creer-un-projet.md) | La fenêtre étape par étape, la version console et toutes ses options |
| [3. Choisir front et back end](03-choisir-front-et-back.md) | Tous les fronts et back ends, les combinaisons, API séparée ou API dans le site |
| [4. Le projet créé](04-projet-cree.md) | Les dossiers, `start.bat` (toutes ses touches), les fichiers `.env`, le README du projet |
| [5. Le site (front)](05-le-site.md) | Design, couleurs, textes, langues, cookies, pages, SEO, appeler l'API |
| [6. L'API (back end)](06-l-api.md) | Contrôleurs, routes automatiques, helpers, erreurs, CORS, chaque back end |
| [7. Base de données](07-base-de-donnees.md) | MySQL et phpMyAdmin dans Docker, SQLite, `mysqli` / `PDO`, passer de l'un à l'autre |
| [8. Mettre en ligne](08-mise-en-ligne.md) | Build ou Generate, quoi envoyer et où, pour chaque type de projet |
| [9. Dépannage](09-depannage.md) | Les problèmes courants et leur solution |
| [Lexique](lexique.md) | Les mots utilisés (front, API, build, port, Docker...) |

## Modifier DC Scaffold

| Page | Ce qu'on y trouve |
| ---- | ----------------- |
| [10. Ajouter un stack](10-ajouter-un-stack.md) | Le format `stack.json`, les étapes, les jetons, l'API dans le front (`inside`) |
| [11. Robot et catalogue](11-robot-et-catalogue.md) | Le robot de compatibilité, les versions validées, le catalogue en ligne |
| [12. Développer DC Scaffold](12-developper-dc-scaffold.md) | Structure du dépôt, moteur, fenêtre, compiler le setup, publier une version |

## En une minute

1. Installe **`DCScaffold-Setup.exe`** et ouvre **DC Scaffold**.
2. Donne un nom au projet, choisis un **front** (le site), un **back end** (l'API qui garde les données) et les options.
3. DC Scaffold installe ce qui manque, crée le projet et ouvre la page de fin.
4. Dans le projet : double-clique sur **`start.bat`**, puis tape **`D`** pour lancer le site et l'API.
5. Pour mettre en ligne : la section **« Mettre en ligne »** du `README.md` du projet donne les étapes, dans l'ordre.
