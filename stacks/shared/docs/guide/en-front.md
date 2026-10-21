## The site

The site is in `frontend/`.

### Design

The site opens with the DC Scaffold design: dark theme, Barlow Condensed font, loading screen
and "What next?" home page. One setting turns it off or on again, in `{{FRONT_DESIGN_CONFIG}}`:

- `design: true`: the DC Scaffold design (everything is in `{{FRONT_DESIGN_FOLDER}}/`)
- `design: false`: a blank site with a simple style (white background, font of the system), to make your own design.
  Nothing of the DC Scaffold design goes into the site any more: not its theme, its fonts, its home page or the loading screen.
  The home page shows your sections (`{{FRONT_HOME_SECTIONS}}`).

{{FRONT_DESIGN_RESTART}} Once your design is ready, you can delete `{{FRONT_DESIGN_FOLDER}}/` and `{{FRONT_PUBLIC}}/dc-scaffold/` (its logos).

### Colors, fonts and sizes

- **Colors, fonts, text sizes, spacing**: `{{FRONT_CSS}}/utils/variables.css`.
  Change a value (for example `--accent-color`) and the whole site follows.
- **Theme**: light in the simple style. Every component uses `--background-color`, `--surface-color`,
  `--border-color`, `--text-color`, `--text-color-muted` and `--accent-color`: change these variables for another look or a dark site.
  With `design: true`, the DC Scaffold theme (`{{FRONT_DESIGN_FOLDER}}/theme.css`) replaces these colors.
- **Font**: the one of the system in the simple style. For another one: put its files in `{{FRONT_PUBLIC}}/fonts/`,
  declare it in `{{FRONT_CSS}}/utils/fonts.css` (an example is written there), then put its name first in `--font-primary` (`utils/variables.css`).
- **Style of a component**: one file per component in `{{FRONT_CSS}}/components/`, imported in `{{FRONT_CSS}}/main.css`.

### Texts

[two-languages] Every text is in `{{FRONT_TRANSLATIONS}}/`, one file per part of the site:
[two-languages]
[two-languages] ```js
[two-languages] // {{FRONT_TRANSLATIONS}}/pages/index.js
[two-languages] export default {
[two-languages]     fr: { introTitle: 'Bienvenue' },
[two-languages]     en: { introTitle: 'Welcome' },
[two-languages] }
[two-languages] ```
[two-languages]
[two-languages] To show it: {{FRONT_TEXT_USAGE}}. A missing text shows its key, easy to spot on the page.
[two-languages] New text file: create it, then add it to `{{FRONT_TRANSLATIONS}}/translations.js` (`TRANSLATIONS`).
[one-language] The site is in one language: the texts are written straight into the components and pages,
[one-language] with no translation system. To change a text, open the component that shows it (for example `{{FRONT_VIEWS}}/Index/`
[one-language] for the home page) and edit it.

### Languages

[two-languages] The languages of the site are in `{{FRONT_TRANSLATIONS}}/translations.js` (`LANGUAGES`), the first one is the default.

[two-languages] The site is in two languages: the language buttons are at the bottom right (`ChangeLanguageButton`, in the AppShell).
[two-languages] Every text file has a block per language. The language chosen by the visitor is kept for the next visit
[two-languages] only if they accept functional cookies.
[one-language] The site is in one language, as asked: no language buttons and no translation files.
[one-language] For a site in two languages, create the project with DC Scaffold and pick two languages.

### Cookies (banner)

The visitor's choice is in `{{FRONT_STORE}}` ({{FRONT_STORE_LIB}}).

**Add a category**, for example `maps` for an interactive map:

[two-languages] 1. in `{{FRONT_STORE}}`, add `maps: false` to `preferences` and `maps: { required: false }` to `categories`
[two-languages]    (`required: true` = always on, the visitor cannot refuse it)
[two-languages] 2. in `{{FRONT_TRANSLATIONS}}/common/preferences.js`, add `mapsLabel` and `mapsDescription` in every language
[one-language] 1. in `{{FRONT_STORE}}`, add `maps: false` to `preferences`
[one-language] 2. and `maps: { required: false, label: 'Map', description: 'Shows an interactive map' }` to `categories`
[one-language]    (`required: true` = always on, the visitor cannot refuse it; `label` and `description`: texts of the banner)
3. in your code: `if ({{FRONT_PREFS_USAGE}}) { ... }` to show the map only with the visitor's consent

The cookie name and how long it is kept (180 days) are at the top of `{{FRONT_ACTIONS}}`.
[two-languages] The texts of the banner are in `{{FRONT_TRANSLATIONS}}/common/preferences.js`.
[one-language] The texts of the banner are in its component, `PreferencesBanner`.

### New page

- create `{{FRONT_PAGE}}` (copy `{{FRONT_PAGE_COPY}}` to start from an example)
- start it with the reusable top of page **PageHero** (small title, large title, text, buttons):
  `{{FRONT_PAGE_HERO}}`. The home page and the 404 page already use it: the whole site keeps the same look
- put its sections in `{{FRONT_VIEWS}}/About/` (one section = one component)
[two-languages] - add the page to `SEO_PAGES` in `{{FRONT_SEO}}`, then its title and description
[two-languages]    in `{{FRONT_TRANSLATIONS}}/common/seo.js` (`seoAboutTitle`, `seoAboutDescription`)
[one-language] - add the page to `SEO_PAGES` in `{{FRONT_SEO}}`, with its title and description

### SEO

[two-languages] - Title, description and sharing image of each page: `{{FRONT_SEO}}` and `{{FRONT_TRANSLATIONS}}/common/seo.js`
[one-language] - Title, description and sharing image of each page: `{{FRONT_SEO}}` (`SEO_PAGES`)
- Default sharing image: `{{FRONT_PUBLIC}}/og-image.jpg` (1200 × 630 px)
- `sitemap.xml` and `robots.txt` are created automatically with the production site

### Name and address of the site

{{FRONT_SITE_CONFIG}}

### Access and redirects

Rules run before every page (redirect, protect an admin page...) are in `{{FRONT_MIDDLEWARE}}`.

### Frame of the pages (AppShell)

What surrounds every page, the 404 page included, is in `{{FRONT_LAYOUT}}`:
[two-languages] loading screen, header (menu), footer, floating buttons (back to top, languages) and cookie banner.
[one-language] loading screen, header (menu), footer, back to top button and cookie banner.

- **Menu**: add your links in the header (`{{FRONT_HEADER}}`)
- **Footer**: `{{FRONT_FOOTER}}` (the "Cookie settings" button opens the banner again, on the current choice)
- **Loading screen**: on load and on every page change, with the DC Scaffold design; `LOADER_ENABLED` at the top of the AppShell: `true` to always have it, `false` for never
- **Minimum loading time** between two pages: `LOADER_PAGE_TIME` at the top of the AppShell (400 ms)

### Good to know ({{FRONT_LABEL}})

{{FRONT_DOC}}
