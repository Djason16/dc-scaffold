# 9. Dépannage

[← Sommaire](README.md)

## Pendant la création

| Problème | Solution |
| -------- | -------- |
| « Windows a protégé votre ordinateur » | L'exe n'est pas encore signé : *Informations complémentaires* → *Exécuter quand même* |
| « Le dossier ... existe déjà et contient des fichiers » | Choisis un autre nom ou un autre dossier (en console : `-Force` pour l'utiliser quand même) |
| « Le port ... est déjà pris » | Un autre programme utilise ce port : change-le dans les options (ports) ou arrête l'autre programme. Ce n'est qu'un avertissement |
| « L'outil winget est introuvable » | Installe l'outil demandé depuis la page ouverte, puis relance DC Scaffold. winget vient avec « Programme d'installation d'application » du Microsoft Store |
| Docker installé mais ne démarre pas | Juste après l'installation de Docker Desktop, redémarre Windows (WSL 2 est requis), puis relance |
| « Docker ne répond pas » | Démarre Docker Desktop à la main, attends qu'il soit prêt, relance |
| L'installation des modules a échoué (npm) | DC Scaffold réessaie tout seul avec la dernière version de npm. Sinon : connexion internet, puis `start.bat` puis `I` |
| « La création du site / du serveur a échoué » | Le message juste au-dessus donne la cause. Le dossier à moitié créé est supprimé : corrige et relance |
| « Impossible de supprimer ... entièrement » | Un fichier est ouvert (VS Code, terminal) : ferme-le et supprime le dossier à la main |
| Extensions PHP manquantes | Pas grave : le projet tourne dans Docker, qui a tout. Accepte l'activation pour utiliser PHP sur ton ordinateur |
| « Dépôt créé, sans premier commit » | Donne ton nom et ton e-mail à Git (`git config --global user.name ...`, `user.email ...`), puis fais le commit |
| Extension VS Code non installée | Installe-la depuis l'onglet Extensions de VS Code |
| « API dans le site » n'est possible qu'avec un front qui a son propre serveur | Cette carte ne va qu'avec Next.js, SvelteKit, Astro ou Qwik : change de front ou de back end |

## En développement

| Problème | Solution |
| -------- | -------- |
| Le site ne joint pas l'API (`Unable to contact the server`) | L'API tourne-t-elle ? (`start.bat` puis `D`, fenêtre « API »). L'adresse de l'API dans `frontend/.env` est-elle la bonne ? Relance le site après avoir modifié `.env` |
| Erreur CORS dans la console du navigateur | `APP_BASE_URL` du `.env` de l'API doit être exactement l'adresse du site (port compris, sans `/` final) |
| « Docker is not running » au lancement | Démarre Docker Desktop, puis `start.bat` puis `D` |
| MySQL refuse la connexion juste après le lancement | MySQL met quelques secondes à démarrer au premier lancement ; réessaie |
| Mes tables de `mysql/init/` ne sont pas créées | Elles ne s'exécutent que si `database/` est vide : `S`, supprime `database/`, `D` (attention : supprime les données) |
| Le design reste après `design: false` | Relance `npm run dev` (le réglage est lu au démarrage) |
| Un texte affiche sa clé (`introTitle`) | La clé n'existe pas dans `plugins/translations/` pour cette langue |
| Une route renvoie 404 `Route not found` | Vérifie le nom du fichier (`...Controller`) et de la méthode (`getAll`, `getOne`...) ; avec l'API dans le site, l'adresse commence par `/api` |
| Une route renvoie 405 | L'adresse existe mais pas pour cette méthode HTTP (par exemple `DELETE` sans méthode `delete()`) |
| Erreur 500 | Le vrai message est dans la réponse en développement et dans la fenêtre « API » (`[API] ...`) |
| `next build` signale un `package-lock.json` dans ton dossier utilisateur | Un `package-lock.json` traîne dans `C:\Users\<toi>` : supprime-le s'il ne sert à rien |

## En ligne

| Problème | Solution |
| -------- | -------- |
| Le site en ligne appelle `localhost` | L'adresse de l'API de `frontend/.env.production` n'était pas remplie au moment du build : corrige, refais le build, renvoie |
| Une page en ligne affiche une 404 en rechargeant | L'hébergement n'utilise pas le `.htaccess` fourni (Apache) : active-le, ou configure l'équivalent chez ton hébergeur |
| L'API PHP affiche la liste des fichiers ou le code | Le domaine de l'API doit pointer sur `backend/public/`, pas sur `backend/` |
| L'API dans le site ne démarre pas en ligne | L'hébergement doit être Node.js 22.13+, et lancer `npm start` dans `frontend/` |
| Erreur 500 sans détail en ligne | Normal : en production, le message est caché. Regarde les journaux de l'hébergeur |

## Réinstaller les dépendances

`start.bat` puis `I` installe tout (`composer install`, `npm install`) dans chaque dossier. Après un `git clone` du projet
sur un autre ordinateur, c'est la première chose à faire, avec la copie des `.env.example` en `.env`.
