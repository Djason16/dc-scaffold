<!-- Section of the project README. Lines start with a tag: [fr] / [en] = language, [fr-api] / [en-api] = only with a back end, [fr-one-language] / [fr-two-languages]... = only for that number of languages -->
[fr] - Pages : `frontend/pages/*.html` (`/` affiche `pages/index.html`, `/about` affiche `pages/about.html`). L'en-tête, le pied de page et les boutons sont ajoutés à chaque page par `js/components/layout/AppShell/`
[fr-two-languages] - Styles dans `frontend/assets/css/`, scripts dans `frontend/js/` (modules ES), textes repérés par `data-i18n` (voir `js/plugins/lang.js`)
[fr-one-language] - Styles dans `frontend/assets/css/`, scripts dans `frontend/js/` (modules ES), textes écrits directement dans les pages HTML
[fr] - Développement : servi par un conteneur nginx (`start.bat` puis `D`), sans compilation
[fr] - Production : envoie `frontend/` tel quel (`.htaccess` compris)
[fr-api] - Client de l'API : `frontend/js/api.js` → `import { api } from './api.js'` ; adresse dans `frontend/js/config.js` (localhost en développement, vrai domaine en ligne)
[en] - Pages: `frontend/pages/*.html` (`/` serves `pages/index.html`, `/about` serves `pages/about.html`). Header, footer and buttons are added to every page by `js/components/layout/AppShell/`
[en-two-languages] - Styles in `frontend/assets/css/`, scripts in `frontend/js/` (ES modules), texts marked with `data-i18n` (see `js/plugins/lang.js`)
[en-one-language] - Styles in `frontend/assets/css/`, scripts in `frontend/js/` (ES modules), texts written straight into the HTML pages
[en] - Development: served by an nginx container (`start.bat` then `D`), no build step
[en] - Production: upload `frontend/` as-is (`.htaccess` included)
[en-api] - API client: `frontend/js/api.js` → `import { api } from './api.js'`; URL in `frontend/js/config.js` (localhost in dev, real domain online)
