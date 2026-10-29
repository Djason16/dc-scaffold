# Lexique

[← Sommaire](README.md)

| Mot | Ce que ça veut dire |
| --- | ------------------- |
| **Front** | Le site : ce que les visiteurs voient dans leur navigateur. Dossier `frontend/` |
| **Back end / API** | Le serveur qui enregistre et renvoie les données. Le site lui parle par des adresses comme `/products` |
| **API séparée** | L'API est un programme à part (`backend/`), envoyé à part en ligne |
| **API dans le site** | L'API vit dans le serveur du front, sous `/api` : un seul serveur. Avec Nuxt + Nitro, ou la carte « API dans le site » pour Next.js, SvelteKit, Astro, Qwik |
| **Stack** | Un front ou un back end proposé par DC Scaffold (un dossier de `stacks/` avec son `stack.json`) |
| **Contrôleur** | Un fichier de l'API qui regroupe les routes d'une chose (`ProductsController` : les produits) |
| **Route** | Une adresse de l'API et sa méthode : `GET /products`, `POST /products` |
| **Méthode HTTP** | Le type de demande : `GET` (lire), `POST` (créer), `PUT` / `PATCH` (modifier), `DELETE` (supprimer) |
| **JSON** | Le format des réponses de l'API : `{ "success": true, "products": [...] }` |
| **Helper** | Petit outil partagé : `ResponseHelper` (répondre), `RequestHelper` (lire la demande), `DatabaseHelper` (base) |
| **CORS** | La règle du navigateur qui empêche un site d'appeler une API sur une autre adresse, sauf si l'API l'autorise (`APP_BASE_URL`) |
| **Base de données** | Là où les données sont gardées : MySQL (un serveur) ou SQLite (un fichier) |
| **phpMyAdmin** | Une page web pour voir et modifier les tables MySQL (http://localhost:8081) |
| **Docker** | Un logiciel qui fait tourner PHP, MySQL, phpMyAdmin ou nginx sans les installer sur l'ordinateur |
| **Node.js** | Le programme qui fait tourner le JavaScript hors du navigateur : outils des fronts, API JavaScript |
| **npm** | L'outil qui installe les paquets JavaScript (`node_modules/`) |
| **Composer** | L'outil qui installe les paquets PHP (`vendor/`) |
| **Port** | Le numéro à la fin d'une adresse locale (`localhost:3000`) ; chaque programme a le sien |
| **`.env`** | Les réglages et les mots de passe du projet. Ils ne quittent pas ton ordinateur (pas dans Git) |
| **Build** | La version optimisée du site, prête à mettre en ligne (`start.bat` puis `B`) |
| **Generate** | Pour Nuxt : le build en site statique (`start.bat` puis `G`) |
| **Site statique** | Des fichiers HTML, CSS, JS prêts : n'importe quel hébergeur peut les servir, sans programme qui tourne |
| **Serveur Node.js** | Un programme qui tourne en permanence chez l'hébergeur (`npm start`) : nécessaire pour une API JavaScript ou l'API dans le site |
| **Pré-rendu** | Une page écrite en HTML au moment du build, au lieu d'être calculée à chaque visite |
| **Composant** | Un morceau de page réutilisable (un bouton, un en-tête...), rangé dans son propre fichier |
| **Store** | L'endroit où le site garde un état partagé (ici : les choix du bandeau cookies) |
| **SEO** | Ce qui aide les moteurs de recherche : titre, description, `sitemap.xml`, `robots.txt` |
| **Catalogue** | Les stacks à jour publiés en ligne par le robot, téléchargés tout seuls par DC Scaffold |
| **Version validée** | La version d'un framework testée par le robot (`stable` dans `stack.json`) |
| **winget** | Le gestionnaire d'applications de Windows, utilisé pour installer Node.js, Docker, Git, VS Code |
