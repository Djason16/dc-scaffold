# 1. Installation

[← Sommaire](README.md)

## Ce qu'il faut

| Système | Il faut | Conseillé |
| ------- | ------- | --------- |
| **Windows 10 ou 11, 64 bits** | Rien d'autre | PowerShell 7 (sinon Windows PowerShell, déjà là) |
| **macOS 11 ou plus** (Apple Silicon ou Intel) | **PowerShell 7** : `brew install --cask powershell`, ou le paquet `.pkg` de [la page de PowerShell](https://aka.ms/powershell-release?tag=stable) | Homebrew ([brew.sh](https://brew.sh)) : DC Scaffold s'en sert pour installer les outils ; Chrome, Edge, Brave ou Chromium pour la fenêtre |
| **Linux 64 bits** (Ubuntu, Debian, Fedora...) | **PowerShell 7** : `sudo snap install powershell --classic`, ou le paquet de ta distribution ([instructions](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-linux)) | Chrome, Chromium, Edge ou Brave pour la fenêtre ; `zenity` (GNOME) ou `kdialog` (KDE) pour le bouton « Parcourir » |

Le reste est **proposé au premier projet**, seulement si tes choix en ont besoin (voir plus bas). Sans PowerShell 7,
DC Scaffold (macOS, Linux) s'ouvre sur un message qui dit quoi installer.

## Installer

Tout est dans l'onglet *Releases* du dépôt GitHub, un fichier par système. DC Scaffold s'installe **pour ton compte
seulement, sans droits administrateur**.

### Windows

1. Télécharge **`DCScaffold-Setup.exe`** (aussi à la racine du dépôt) et lance-le. L'assistant est en français ou en
   anglais, selon la langue de Windows.
2. Pages de l'assistant : bienvenue, licence, composants (DC Scaffold, raccourci sur le bureau), dossier, fin.
3. DC Scaffold s'installe dans `C:\Users\<toi>\AppData\Local\Programs\DC Scaffold`.

> **SmartScreen.** Au premier lancement, Windows peut afficher « Windows a protégé votre ordinateur » : l'exe n'est pas
> encore signé. Clique sur *Informations complémentaires*, puis *Exécuter quand même*.

Installation silencieuse : `DCScaffold-Setup.exe /S`.

### macOS

1. Télécharge **`DCScaffold-<version>-mac-arm64.dmg`** (Mac Apple Silicon : M1, M2...) ou **`-mac-x64.dmg`** (Mac Intel).
   Le même existe en `.zip`.
2. Ouvre-le et glisse **DC Scaffold** dans **Applications**.
3. Premier lancement : l'app n'est pas signée par Apple, macOS la bloque une fois. Ouvre-la, puis *Réglages Système →
   Confidentialité et sécurité → Ouvrir quand même* (sur les anciens macOS : clic droit sur l'app → *Ouvrir*). Ou, dans un
   terminal : `xattr -dr com.apple.quarantine "/Applications/DC Scaffold.app"`.

### Linux

1. Télécharge **`DCScaffold-<version>-linux-x64.tar.gz`**, puis dans un terminal :
   ```
   tar -xzf DCScaffold-1.6.0-linux-x64.tar.gz
   cd DCScaffold-1.6.0-linux-x64
   ./install.sh
   ```
2. `install.sh` ne demande jamais `sudo` : il copie DC Scaffold dans `~/.local/share/dc-scaffold`, ajoute la commande
   `dcscaffold` dans `~/.local/bin` et DC Scaffold au **menu des applications** (avec son icône).
3. Si ton terminal ne trouve pas `dcscaffold` : ajoute `export PATH="$HOME/.local/bin:$PATH"` à ton `~/.profile`.

### Ce qui est installé

| Élément | Windows | macOS | Linux |
| ------- | ------- | ----- | ----- |
| La fenêtre de DC Scaffold | `DCScaffold.exe` | `DC Scaffold.app` | `~/.local/share/dc-scaffold/DCScaffold` |
| Le moteur (PowerShell) et ses textes | `engine\` | dans l'app (`Contents/Resources`) | `~/.local/share/dc-scaffold/engine` |
| Les modèles de tous les fronts et back ends | `stacks\` | dans l'app | `~/.local/share/dc-scaffold/stacks` |
| Raccourcis | Menu Démarrer, bureau | Applications, Launchpad | Menu des applications |
| Commande de la version console | `dcscaffold` | `"/Applications/DC Scaffold.app/Contents/MacOS/DCScaffold" --console` | `dcscaffold` (`dcscaffold --window` : la fenêtre) |
| Désinstallation | Paramètres Windows → Applications | Glisser l'app à la corbeille | `~/.local/share/dc-scaffold/uninstall.sh` |

## Ouvrir DC Scaffold

- **Menu Démarrer**, **bureau**, **Applications** (macOS) ou **menu des applications** (Linux) → DC Scaffold : la fenêtre
  s'ouvre. Elle est affichée par un navigateur en mode application (sans barre d'adresse), avec son propre profil :
  Edge (déjà dans Windows) ou Chrome sous Windows ; Chrome, Edge, Brave ou Chromium sous macOS et Linux. Sans aucun
  d'eux, elle s'ouvre dans un onglet du navigateur par défaut.
- **Terminal** : `dcscaffold` lance la version console (mêmes choix, sous forme de questions).
- Le bouton **Version console**, sous le titre de la fenêtre, ouvre aussi la version console (Terminal sous macOS,
  le terminal du bureau sous Linux).
- La langue (français / anglais) se choisit en haut à droite et reste mémorisée.

## Les outils installés au besoin

Avant chaque création, DC Scaffold vérifie les outils dont **ce projet** a besoin, et propose d'installer ceux qui
manquent, **toujours après ton accord** :

| Outil | Quand | Pourquoi |
| ----- | ----- | -------- |
| **Node.js** | Tous les fronts sauf HTML/CSS/JS, les back ends JavaScript | Faire tourner et compiler le site, l'API JavaScript |
| **Docker Desktop** | Back end PHP, base MySQL, front HTML/CSS/JS | Faire tourner PHP, MySQL et phpMyAdmin sans les installer |
| **Git** | Toujours (sauf si tu le désactives) | Premier commit du projet |
| **PHP** et **Composer** | Back end PHP | Conseillés pour coder en PHP sur ton ordinateur. Sans eux, l'image Docker `composer` est utilisée |
| **Visual Studio Code** | Toujours (sauf si tu le désactives) | L'éditeur, avec **GitHub Copilot** et les extensions des stacks choisis |

Comment ils s'installent :

| Système | Comment |
| ------- | ------- |
| Windows | **winget**, le gestionnaire d'applications de Windows |
| macOS avec Homebrew | `brew install` (Node.js LTS : `node@<version>`, Docker Desktop et VS Code : `--cask`) |
| macOS sans Homebrew | Node.js : l'installateur officiel s'ouvre (il demande ton mot de passe) ; Git : les outils de développement d'Apple ; le reste : la page de téléchargement s'ouvre |
| Linux | Node.js LTS et Composer : installés **pour ton compte** dans `~/.local` (fichiers officiels vérifiés par leur empreinte, sans `sudo`). Git et PHP : DC Scaffold écrit la commande à taper (`sudo apt install git`...). Docker et VS Code : la page d'installation s'ouvre |

DC Scaffold ne lance **jamais** `sudo` tout seul : ce qui en a besoin est écrit pour que tu le tapes.

- Une version de Node.js trop ancienne pour un stack (par exemple AdonisJS demande Node.js 24) : la mise à jour est proposée.
- Docker installé mais arrêté : DC Scaffold propose de le démarrer (jusqu'à 3 minutes). Sous Linux, Docker Desktop
  démarre tout seul ; le Docker Engine (service du système) se démarre avec `sudo systemctl start docker`.
- PHP local sans certaines extensions (Windows) : DC Scaffold propose de les activer dans ton `php.ini` (une copie `.bak`
  est faite avant). Ce n'est pas obligatoire : le projet tourne dans Docker, qui a déjà tout.

## Mises à jour

Il y a **deux sortes de mises à jour**, et elles n'arrivent pas de la même façon :

| Quoi | Comment ça arrive | Ce que tu fais |
| ---- | ----------------- | -------------- |
| **L'application** (la fenêtre, le moteur) | Au démarrage, DC Scaffold regarde la dernière version sur GitHub. Un bouton **« Mettre à jour »** apparaît dans la fenêtre | Windows : le nouveau setup se télécharge et remplace l'ancien. macOS : la nouvelle version arrive dans *Téléchargements* et s'ouvre dans le Finder, glisse-la dans Applications (Remplacer). Linux : elle s'installe toute seule (`install.sh`), rouvre DC Scaffold |
| **Les stacks** (modèles des projets, versions des frameworks) | À chaque ouverture, DC Scaffold télécharge le **catalogue** en ligne s'il est plus récent | Rien : c'est automatique, sans réinstaller |

Les stacks téléchargés vont dans le dossier `catalog` (voir plus bas), après vérification de leur empreinte (sha256).
Sans internet, DC Scaffold garde ceux de l'installation. Un catalogue prévu pour une version plus récente de
l'application n'est pas utilisé tant que l'application n'est pas mise à jour (voir [11. Robot et catalogue](11-robot-et-catalogue.md)).

## Ce que DC Scaffold garde sur l'ordinateur

| Contenu | Windows | macOS | Linux |
| ------- | ------- | ----- | ----- |
| La langue et le dernier dossier (`settings.json`), tes stacks personnels (`stacks/`, voir [10. Ajouter un stack](10-ajouter-un-stack.md)) | `%APPDATA%\DC Scaffold` | `~/Library/Application Support/DC Scaffold` | `~/.config/dc-scaffold` |
| Les stacks téléchargés du catalogue (`catalog/`) | `%LOCALAPPDATA%\DC Scaffold\catalog` | `~/Library/Application Support/DC Scaffold/catalog` | `~/.config/dc-scaffold/catalog` |
| Le profil de la fenêtre (`window/`) | `%LOCALAPPDATA%\DC Scaffold\window` | `~/Library/Application Support/DC Scaffold/window` | `~/.config/dc-scaffold/window` |

## Désinstaller

- **Windows** : Menu Démarrer → DC Scaffold → **Désinstaller DC Scaffold** (ou Paramètres Windows → Applications).
  Supprimé : le programme, les raccourcis, la commande `dcscaffold`, l'entrée Windows, le profil de la fenêtre. Coche
  **« Mes réglages et mes stacks personnels »** pour supprimer aussi `%APPDATA%\DC Scaffold`.
  Désinstallation silencieuse : `Uninstall.exe /S`.
- **macOS** : glisse `DC Scaffold.app` à la corbeille ; pour les réglages aussi, supprime
  `~/Library/Application Support/DC Scaffold`.
- **Linux** : `~/.local/share/dc-scaffold/uninstall.sh` (programme, commande, menu) ; `uninstall.sh --all` supprime aussi
  `~/.config/dc-scaffold`.

**Tes projets ne sont jamais touchés.**
