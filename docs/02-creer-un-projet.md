# 2. Créer un projet

[← Sommaire](README.md)

## Dans la fenêtre

La fenêtre a cinq étapes. Le bouton **Suivant** passe à l'étape d'après ; un double-clic sur une carte la choisit et avance.

### Étape 1 : Projet

- **Nom** : le nom du site. Le dossier créé en est tiré (`Ma Boutique` → `ma-boutique`).
- **Dossier** : où créer le projet (bouton « Parcourir »). Le dernier dossier utilisé est proposé.
- Si le dossier du projet existe déjà et n'est pas vide, la création est refusée (rien n'est écrasé).

### Étape 2 : Front (le site)

Une carte par framework : Nuxt, Next.js, SvelteKit, Vue, React, Svelte, SolidJS, Angular, Qwik, Astro, HTML/CSS/JS,
ou **Aucun** (seulement une API). Chaque carte indique son port de développement et ce dont il a besoin (Node.js, Docker).
Détail de chaque front : [3. Choisir front et back end](03-choisir-front-et-back.md).

### Étape 3 : Back end (l'API)

Une carte par serveur : Slim 4, Laravel, Symfony, PHP, Nitro, Express, NestJS, AdonisJS, **API dans le site**,
ou **Aucun** (site sans données à enregistrer).

- **API dans le site** n'apparaît qu'avec Next.js, SvelteKit, Astro ou Qwik : l'API est rangée dans le serveur du front.
- Avec Nuxt, la carte Nitro porte le badge **« API dans le site »** : Nitro est déjà le serveur de Nuxt, l'API ira dans le site.
- Si tu changes de front et que le back end choisi n'existe pas avec lui, il faut en choisir un autre.

### Étape 4 : Options

| Option | Rôle |
| ------ | ---- |
| **Base de données** | Fixée à MySQL pour les back ends PHP. Pour les back ends JavaScript : MySQL (dans Docker) ou SQLite (un simple fichier, rien à installer) |
| **Accès à MySQL** | Slim et PHP : `mysqli` ou `PDO` |
| **Langues du site** | Français, anglais, ou les deux (boutons de langue et textes traduits) |
| **Git** | Crée le dépôt et le premier commit |
| **VS Code + Copilot** | Vérifie VS Code, GitHub Copilot et les extensions des stacks choisis |
| **Dernières versions majeures** | Utilise une nouvelle version majeure d'un framework même si elle n'est pas encore validée (déconseillé pour débuter) |
| **Ports** (repliés) | Port du site, de l'API, de phpMyAdmin, de MySQL. Les valeurs par défaut conviennent presque toujours |

Le **récapitulatif** à droite résume tout. Quand l'API va dans le site (Nuxt + Nitro, ou la carte « API dans le site »), une phrase
en vert l'explique et le port de l'API disparaît (l'API est sur l'adresse du site, sous `/api`).

### Étape 5 : Création

La création se suit en direct, en 8 étapes :

1. **Configuration** : nom, dossier, stack, ports déjà pris signalés
2. **Outils** : vérification et installation de ce qui manque
3. **Versions** : dernière version de chaque paquet sur npm / Packagist
4. **Fichiers communs** : `README.md`, `start.bat`, `docker-compose.yml`, MySQL, `.gitignore`, VS Code
5. **API** : création du back end dans `backend/` (ou annonce qu'il ira dans le site)
6. **Front** : création du site dans `frontend/` (et de l'API dans le site, le cas échéant)
7. **Dépendances** : `npm install` / `composer install`
8. **Git** : dépôt et premier commit

Chaque décision t'est demandée dans la fenêtre, avec son explication : installer ou mettre à jour Node.js, démarrer
Docker, utiliser une nouvelle version majeure, activer des extensions PHP...

**Si une étape échoue**, le dossier à moitié créé est supprimé (seulement s'il a été créé par cette création) : corrige
le problème indiqué et relance. **Annuler** arrête tout et supprime aussi le dossier.

À la fin : **Lancer le projet** (comme `start.bat` puis `D`), **Ouvrir le dossier**, **Ouvrir dans VS Code**, avec les
adresses du projet et le mot de passe MySQL.

## En console

`dcscaffold` dans un terminal, ou le bouton **Version console**. Sans option, il pose les questions une par une.
Avec des options, il ne demande que ce qui manque.

```
dcscaffold -Lang fr -Name "Mon site" -Front vanilla -Back none
dcscaffold -Name "Boutique" -Front nuxt -Back slim -Database mysql -Driver pdo -ApiPort 8010
dcscaffold -Name "Blog" -Front sveltekit -Back site -Database sqlite -Languages fr,en
```

| Option | Valeurs | Par défaut |
| ------ | ------- | ---------- |
| `-Lang` | `fr`, `en` : langue de DC Scaffold, du README et des commentaires | la dernière utilisée |
| `-Name` | nom du projet | demandé |
| `-Destination` | dossier parent du projet | le dernier utilisé |
| `-Front` | `nuxt`, `next`, `sveltekit`, `vue`, `react`, `svelte`, `solid`, `angular`, `qwik`, `astro`, `vanilla`, `none` | demandé |
| `-Back` | `slim`, `laravel`, `symfony`, `php`, `nitro`, `express`, `nest`, `adonis`, `site`, `none` | demandé |
| `-Database` | `mysql`, `sqlite` (back ends JavaScript ; les back ends PHP utilisent toujours MySQL) | MySQL |
| `-Driver` | `mysqli`, `pdo` (Slim et PHP) | `mysqli` |
| `-Languages` | `fr`, `en`, `fr,en`, `en,fr` (la première est la langue par défaut) | la langue de `-Lang` |
| `-AppPort` | port du site en développement | celui du framework (3000, 5173, 4321...) |
| `-ApiPort` | port de l'API séparée | 8000 |
| `-PmaPort` | port de phpMyAdmin | 8081 |
| `-DbPort` | port de MySQL sur l'ordinateur (back ends JavaScript) | 3306 |
| `-UseLatest` | utilise les nouvelles versions majeures non validées | non |
| `-SkipToolCheck` | ne vérifie pas les outils | non |
| `-SkipInstall` | ne lance pas `npm install` / `composer install` (à faire ensuite avec `start.bat` puis `I`) | non |
| `-NoGit` | pas de dépôt Git | non |
| `-NoEditor` | ne vérifie pas VS Code et ses extensions | non |
| `-Force` | accepte un dossier de projet qui existe déjà | non |

`-Back site` n'est accepté qu'avec `-Front next`, `sveltekit`, `astro` ou `qwik`. Avec un autre front, DC Scaffold
s'arrête et dit lesquels choisir.

## Les versions des frameworks

- Chaque stack a une **version validée** (testée chaque semaine par le robot, voir [11. Robot et catalogue](11-robot-et-catalogue.md)).
- À la création, DC Scaffold prend la dernière version de cette version majeure (par exemple Nuxt 4.x).
- Si une **nouvelle version majeure** existe, elle est signalée et proposée, jamais imposée. `-UseLatest` (ou l'option
  de la fenêtre) l'utilise directement.
