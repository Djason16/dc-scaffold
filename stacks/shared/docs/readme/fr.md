<!-- README.md of the project when DC Scaffold runs in French. [nofront] / [noback] lines: only without a front / a back end -->
# {{PROJECT_NAME}}

{{STACK_LABEL}}

## Démarrer

1. Double-clique sur `start.bat`, à la racine du projet.
2. Tape `D` puis Entrée : tout se lance (Docker si besoin, le serveur, le site) et ton navigateur s'ouvre.

{{URL_TABLE}}

Les autres lettres du menu :

- `I` : installe ou met à jour les modules du projet
- `S` : arrête Docker
- `R` : reconstruit Docker (utile si quelque chose ne démarre plus)
- `G` / `B` / `A` : préparent la version à mettre en ligne (selon le projet)

Pour écrire le code, ouvre le dossier dans VS Code : il propose les extensions conseillées pour ce projet, dont GitHub Copilot
(l'assistant qui t'aide à coder, à connecter une fois avec ton compte GitHub).

Ce fichier explique où se trouve chaque chose et comment la changer. Les mots techniques sont expliqués dans le
[petit lexique](#petit-lexique) en bas.

[nofront] Ce projet n'a pas de front : c'est seulement une API.
[noback] Ce projet n'a pas de back end : c'est un site simple, sans données à enregistrer. Crée un nouveau projet avec un back end s'il grandit.

{{GUIDE}}

## Mettre en ligne

{{DEPLOY_STEPS}}

## Fichiers d'environnement

Les `.env` et `.env.production` restent sur ton ordinateur (ils contiennent les mots de passe) ; seuls les `.env.example`
vont sur Git (GitHub par exemple).

## Petit lexique

- **Front** : le site, ce que voient les visiteurs dans leur navigateur (`frontend/`).
- **Back end / API** : le serveur qui enregistre et renvoie les données (`{{BACK_DIR}}/`). Le site lui parle par des adresses comme `/products`.
- **Docker** : un logiciel qui fait tourner MySQL (et PHP) sans rien installer d'autre sur ton ordinateur.
- **Port** : le numéro à la fin d'une adresse locale (`localhost:3000`) ; chaque programme a le sien.
- **`.env`** : les réglages et les mots de passe du projet. Ils ne quittent pas ton ordinateur.
- **Build** : la version optimisée du site, prête à mettre en ligne.
- **Composant** : un morceau de page réutilisable (un bouton, un en-tête...), rangé dans son propre fichier.
