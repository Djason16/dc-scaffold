# 1. Installation

[← Sommaire](README.md)

## Ce qu'il faut

- **Windows 10 ou 11, 64 bits.** C'est tout pour commencer.
- Le reste est **proposé au premier projet**, seulement si tes choix en ont besoin (voir plus bas).

## Installer

1. Télécharge **`DCScaffold-Setup.exe`** (onglet *Releases* du dépôt GitHub, ou à la racine du dépôt).
2. Lance-le. L'assistant est en français ou en anglais, selon la langue de Windows.
3. Pages de l'assistant : bienvenue, licence, composants (DC Scaffold, raccourci sur le bureau), dossier, fin.
4. DC Scaffold s'installe **pour ton compte seulement, sans droits administrateur**, dans
   `C:\Users\<toi>\AppData\Local\Programs\DC Scaffold`.

> **SmartScreen.** Au premier lancement, Windows peut afficher « Windows a protégé votre ordinateur » : l'exe n'est pas
> encore signé. Clique sur *Informations complémentaires*, puis *Exécuter quand même*.

### Ce qui est installé

| Élément | Rôle |
| ------- | ---- |
| `DCScaffold.exe` | La fenêtre de DC Scaffold |
| `engine\` | Le moteur (PowerShell) qui crée les projets, avec ses textes français et anglais |
| `stacks\` | Les modèles de tous les fronts et back ends |
| `assets\` | Logo et icône |
| Menu Démarrer | « DC Scaffold » et « Désinstaller DC Scaffold » |
| Commande `dcscaffold` | La version console, dans n'importe quel terminal |
| Paramètres Windows → Applications | L'entrée DC Scaffold, pour désinstaller |

Installation silencieuse : `DCScaffold-Setup.exe /S`.

## Ouvrir DC Scaffold

- **Menu Démarrer** ou **bureau** → DC Scaffold : la fenêtre s'ouvre. Elle est affichée par Microsoft Edge en mode
  application (sans barre d'adresse), déjà présent dans Windows ; Chrome sert si Edge manque.
- **Terminal** : `dcscaffold` lance la version console (mêmes choix, sous forme de questions).
- Le bouton **Version console**, sous le titre de la fenêtre, ouvre aussi la version console.
- La langue (français / anglais) se choisit en haut à droite et reste mémorisée.

## Les outils installés au besoin

Avant chaque création, DC Scaffold vérifie les outils dont **ce projet** a besoin, et propose d'installer ceux qui
manquent (avec **winget**, le gestionnaire d'applications de Windows, après ton accord) :

| Outil | Quand | Pourquoi |
| ----- | ----- | -------- |
| **Node.js** | Tous les fronts sauf HTML/CSS/JS, les back ends JavaScript | Faire tourner et compiler le site, l'API JavaScript |
| **Docker Desktop** | Back end PHP, base MySQL, front HTML/CSS/JS | Faire tourner PHP, MySQL et phpMyAdmin sans les installer |
| **Git** | Toujours (sauf si tu le désactives) | Premier commit du projet |
| **PHP** et **Composer** | Back end PHP | Conseillés pour coder en PHP sur ton ordinateur. Sans eux, l'image Docker `composer` est utilisée |
| **Visual Studio Code** | Toujours (sauf si tu le désactives) | L'éditeur, avec **GitHub Copilot** et les extensions des stacks choisis |

- Une version de Node.js trop ancienne pour un stack (par exemple AdonisJS demande Node.js 24) : la mise à jour est proposée.
- Docker installé mais arrêté : DC Scaffold propose de le démarrer (jusqu'à 3 minutes).
- PHP local sans certaines extensions : DC Scaffold propose de les activer dans ton `php.ini` (une copie `.bak` est faite
  avant). Ce n'est pas obligatoire : le projet tourne dans Docker, qui a déjà tout.

## Mises à jour

Il y a **deux sortes de mises à jour**, et elles n'arrivent pas de la même façon :

| Quoi | Comment ça arrive | Ce que tu fais |
| ---- | ----------------- | -------------- |
| **L'application** (la fenêtre, le moteur) | Au démarrage, DC Scaffold regarde la dernière version sur GitHub. Un bouton **« Mettre à jour »** apparaît dans la fenêtre | Un clic : le nouveau setup se télécharge et remplace l'ancien |
| **Les stacks** (modèles des projets, versions des frameworks) | À chaque ouverture, DC Scaffold télécharge le **catalogue** en ligne s'il est plus récent | Rien : c'est automatique, sans réinstaller |

Les stacks téléchargés vont dans `%LOCALAPPDATA%\DC Scaffold\catalog`, après vérification de leur empreinte (sha256).
Sans internet, DC Scaffold garde ceux de l'installation. Un catalogue prévu pour une version plus récente de
l'application n'est pas utilisé tant que l'application n'est pas mise à jour (voir [11. Robot et catalogue](11-robot-et-catalogue.md)).

## Ce que DC Scaffold garde sur l'ordinateur

| Dossier | Contenu |
| ------- | ------- |
| `%APPDATA%\DC Scaffold\settings.json` | La langue et le dernier dossier utilisé |
| `%APPDATA%\DC Scaffold\stacks\` | Tes stacks personnels (voir [10. Ajouter un stack](10-ajouter-un-stack.md)) |
| `%LOCALAPPDATA%\DC Scaffold\catalog\` | Les stacks téléchargés du catalogue |
| `%LOCALAPPDATA%\DC Scaffold\window\` | Le profil de la fenêtre (Edge) |

## Désinstaller

Menu Démarrer → DC Scaffold → **Désinstaller DC Scaffold** (ou Paramètres Windows → Applications).

- Supprimé : le programme, les raccourcis, la commande `dcscaffold`, l'entrée Windows, le profil de la fenêtre.
- Coche **« Mes réglages et mes stacks personnels »** pour supprimer aussi `%APPDATA%\DC Scaffold`.
- **Tes projets ne sont jamais touchés.**

Désinstallation silencieuse : `Uninstall.exe /S`.
