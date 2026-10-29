# 7. Base de données

[← Sommaire](README.md)

## Les choix

| Back end | Choix |
| -------- | ----- |
| PHP (Slim, Laravel, Symfony, PHP) | **MySQL**, toujours (dans Docker, avec phpMyAdmin) |
| JavaScript (Nitro, Express, NestJS, AdonisJS, API dans le site) | **MySQL** (dans Docker, avec phpMyAdmin) ou **SQLite** (un simple fichier) |

Les méthodes sont **les mêmes** dans les deux cas (`fetchAll`, `fetchOne`, `insert`, `execute`) : le code ne change pas
si tu passes de SQLite à MySQL.

## MySQL et phpMyAdmin (Docker)

- Version : la dernière **MySQL LTS** (actuellement 9.7), mise à jour par le robot de compatibilité.
- La base `<nom_du_projet>_db` est créée au premier démarrage ; utilisateur `root`, **mot de passe généré au hasard**
  et écrit dans le `.env` de l'API (affiché aussi à la fin de la création).
- **phpMyAdmin** : http://localhost:8081, pour voir et modifier les tables.
- Les données sont dans le dossier `database/` du projet (pas dans Git) : elles restent quand tu arrêtes Docker.
- **Créer les tables au premier démarrage** : mets un fichier `.sql` dans `mysql/init/`. Il est exécuté une seule fois,
  quand le dossier `database/` est vide. Pour le rejouer : `start.bat` puis `S`, supprime `database/`, relance avec `D`.
- Réglages de MySQL : `mysql/my.cnf` (intégré à l'image : `start.bat` puis `R` après une modification).
- Fuseau horaire : Europe/Paris (`DB_TIMEZONE`).

Depuis l'API :

| Back end | Adresse de MySQL |
| -------- | ---------------- |
| PHP (dans Docker) | `db` (le nom du service Docker) |
| Node.js (sur l'ordinateur) | `localhost:3306` (port exposé par Docker, modifiable avec `-DbPort`) |

### `mysqli` ou `PDO` (Slim et PHP)

Choisi à la création. La connexion est dans `backend/config/database.php` (`getDbConnection()`), et `DatabaseHelper`
utilise l'un ou l'autre : les méthodes des contrôleurs ne changent pas. Laravel (`DB::select`), Symfony (Doctrine DBAL)
et AdonisJS (Lucid) passent par l'accès de leur framework, derrière les mêmes méthodes : Eloquent, les entités Doctrine
et les modèles Lucid restent disponibles si tu préfères.

## SQLite

- Un simple fichier : `backend/database/database.sqlite` (ou `frontend/database/database.sqlite` avec l'API dans le site),
  **créé tout seul à la première requête**. Rien à installer, pas de Docker.
- Utilise `node:sqlite`, intégré à Node.js (22.13 ou plus récent).
- Le fichier n'est pas dans Git (`*.sqlite` dans `.gitignore`).
- Pour voir les tables : une extension SQLite de VS Code, ou [DB Browser for SQLite](https://sqlitebrowser.org).

## Passer de SQLite à MySQL

1. Ajoute MySQL au projet : le plus simple est de recréer le projet avec MySQL et d'y copier tes contrôleurs ; sinon
   reprends `docker-compose.yml` et le dossier `mysql/` d'un projet créé avec MySQL.
2. Dans le `.env` de l'API : `DB_CONNECTION=mysql` et les valeurs `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`.
3. Le code des contrôleurs ne change pas. Le SQL simple (avec des `?`) marche avec les deux.

## En ligne

Dans `.env.production` de l'API : les identifiants de la base de ton hébergeur (`DB_HOST`, `DB_NAME`, `DB_USER`,
`DB_PASS`, `DB_PORT`). Avec SQLite, le fichier est créé sur le serveur à la première requête (`DB_FILE` choisit son chemin).
