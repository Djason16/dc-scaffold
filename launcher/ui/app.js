// Window of DC Scaffold: five steps (project, front, back end, options, creation), then the result.
// Everything is sent to DCScaffold.exe (app.go), which runs the engine with these choices.

const token = location.hash.slice(1)

// ---------------------------------------------------------------------------
// Texts
// ---------------------------------------------------------------------------

const TEXTS = {
    fr: {
        tagline: 'Créateur de projets web',
        by: 'par',
        version: 'Version',
        updateTitle: 'Nouvelle version disponible',
        updateButton: 'Mettre à jour',
        updateStarting: "L'installation de la nouvelle version s'ouvre : DC Scaffold se ferme le temps de la mise à jour.",
        steps: ['Projet', 'Site', 'Serveur', 'Options', 'Création'],
        step: 'Étape',
        back: 'Retour',
        next: 'Suivant',
        create: 'Créer le projet',
        projectTitle: 'Ton projet',
        projectText: "Choisis un nom et l'endroit où ranger le projet sur ton ordinateur. Un dossier à ce nom sera créé (en minuscules, sans accents ni espaces).",
        nameLabel: 'Nom du projet',
        namePlaceholder: 'Mon site',
        destinationLabel: 'Ranger le projet dans',
        browse: 'Parcourir',
        browseTitle: 'Où ranger le projet ?',
        browseFailed: "La fenêtre de choix du dossier n'a pas pu s'ouvrir : tape le chemin dans le champ.",
        folderPreview: 'Dossier créé :',
        errorName: 'Donne un nom au projet (au moins une lettre ou un chiffre).',
        errorDestination: "Ce dossier n'existe pas : {0}",
        errorUsed: "Le dossier {0} existe déjà et contient des fichiers : choisis un autre nom ou un autre endroit.",
        frontTitle: 'Le site (front)',
        frontText: "La partie que les visiteurs voient dans leur navigateur. Chaque choix donne le même site de départ : pages, menu, bandeau cookies, référencement Google. Pas sûr ? « HTML / CSS / JS » est le plus simple pour débuter.",
        backTitle: 'Le serveur (back end)',
        backText: "La partie invisible qui enregistre et renvoie les données (comptes, articles, formulaires...). Le site lui parle par une API. Un site vitrine n'en a pas besoin : choisis « Aucun ».",
        errorNothing: 'Choisis au moins un site ou un serveur.',
        optionsTitle: 'Les options',
        optionsText: 'Les choix déjà faits conviennent à la plupart des projets : tu peux lancer la création directement.',
        databaseLabel: 'Base de données',
        mysqlText: 'Les données dans MySQL, installé tout seul dans Docker, avec phpMyAdmin pour les voir',
        mysqlFixed: 'Ce serveur utilise toujours MySQL, installé tout seul dans Docker, avec phpMyAdmin',
        driverLabel: 'Accès PHP',
        driverMysqli: 'La façon dont PHP parle à MySQL. mysqli : la plus simple, déjà incluse dans PHP',
        driverPdo: "La façon dont PHP parle à MySQL. PDO : marche aussi avec d'autres bases de données",
        languagesLabel: 'Langues',
        langFr: 'Français',
        langEn: 'English',
        langBoth: 'FR + EN',
        langFrText: 'Site en français',
        langEnText: 'Site en anglais',
        langBothText: 'Deux langues, avec des boutons FR / EN sur le site',
        gitTitle: 'Historique Git',
        gitText: 'Garde la trace de chaque modification (git init)',
        editorTitle: 'VS Code + Copilot',
        editorText: "Installé s'il manque, avec GitHub Copilot et les extensions utiles",
        latestTitle: 'Dernières versions',
        latestText: 'Toujours les toutes dernières. Désactivé : les versions testées, plus sûres',
        portsLabel: 'Ports (réglage avancé)',
        portApp: 'Site',
        portApi: 'Serveur (API)',
        portPma: 'phpMyAdmin',
        portDb: 'MySQL',
        summary: 'Récapitulatif',
        summaryProject: 'Projet',
        summaryFolder: 'Dossier',
        summaryFront: 'Site',
        summaryBack: 'Serveur',
        summaryDatabase: 'Données',
        summaryLanguages: 'Langues',
        none: 'Aucun',
        noneFront: 'Pas de site : seulement le serveur (API)',
        noneBack: 'Pas de serveur : un site simple, sans données à enregistrer',
        noDatabase: 'Aucune',
        custom: 'Perso',
        running: 'Création en cours',
        starting: 'Démarrage',
        cancel: 'Annuler',
        cancelConfirm: 'Arrêter la création ? Le dossier commencé sera supprimé.',
        runningHint: 'Laisse la fenêtre ouverte : la création prend quelques minutes.',
        leaveWarning: 'La création est en cours.',
        doneTitle: 'Projet prêt',
        doneText: 'Pour voir ton site, clique sur « Lancer le projet ». Tout est expliqué dans le fichier README.md, à la racine du projet.',
        launch: 'Lancer le projet',
        openFolder: 'Ouvrir le dossier',
        openCode: 'Ouvrir dans VS Code',
        newProject: 'Nouveau projet',
        databaseUser: 'Utilisateur MySQL',
        databasePassword: 'Mot de passe',
        copy: 'Copier',
        copied: 'Copié',
        launched: 'Le projet démarre dans une nouvelle fenêtre.',
        failedTitle: 'La création a échoué',
        failedText: 'Le dossier commencé a été supprimé. Ouvre le « Journal » plus bas pour voir ce qui a bloqué.',
        cancelledTitle: 'Création annulée',
        cancelledText: "Rien n'a été gardé : tu peux changer tes choix et relancer.",
        editChoices: 'Changer les choix',
        retry: 'Réessayer',
        showLog: 'Journal (détail de la création)',
        errorGeneric: "Quelque chose n'a pas marché : {0}",
        // Messages of DCScaffold.exe, shown in the language of the window
        errors: {
            'folder not found': "Ce dossier n'existe plus (il a peut-être été déplacé ou supprimé)",
            'VS Code not found': "VS Code est introuvable : installe-le depuis code.visualstudio.com",
            'no update': "Aucune mise à jour n'est disponible",
            'unknown action': 'Action inconnue',
            busy: 'Une création est déjà en cours',
        },
        questionTitle: 'DC Scaffold a besoin de ta réponse',
        yes: 'Oui',
        no: 'Non',
        waitingAnswer: 'La création attend ta réponse.',
        console: 'Version console',
        consoleTitle: 'Ouvre DC Scaffold dans une fenêtre PowerShell, en texte seulement',
        consoleOpened: 'La version console s\'ouvre dans une nouvelle fenêtre.',
    },
    en: {
        tagline: 'Web project creator',
        by: 'by',
        version: 'Version',
        updateTitle: 'New version available',
        updateButton: 'Update',
        updateStarting: 'The installer of the new version opens: DC Scaffold closes during the update.',
        steps: ['Project', 'Site', 'Server', 'Options', 'Creation'],
        step: 'Step',
        back: 'Back',
        next: 'Next',
        create: 'Create the project',
        projectTitle: 'Your project',
        projectText: 'Pick a name and the place on your computer where the project goes. A folder with this name will be created (lowercase, no accents or spaces).',
        nameLabel: 'Project name',
        namePlaceholder: 'My site',
        destinationLabel: 'Put the project in',
        browse: 'Browse',
        browseTitle: 'Where should the project go?',
        browseFailed: 'The folder picker could not open: type the path in the field.',
        folderPreview: 'Folder created:',
        errorName: 'Give the project a name (at least one letter or number).',
        errorDestination: 'This folder does not exist: {0}',
        errorUsed: 'The folder {0} already exists and has files in it: pick another name or another place.',
        frontTitle: 'The site (front)',
        frontText: 'The part visitors see in their browser. Every choice gives the same starting site: pages, menu, cookie banner, Google ranking (SEO). Not sure? "HTML / CSS / JS" is the simplest to start.',
        backTitle: 'The server (back end)',
        backText: 'The invisible part that saves and sends back the data (accounts, articles, forms...). The site talks to it through an API. A showcase site does not need one: pick "None".',
        errorNothing: 'Pick at least a site or a server.',
        optionsTitle: 'The options',
        optionsText: 'The choices already made suit most projects: you can start the creation right away.',
        databaseLabel: 'Database',
        mysqlText: 'The data in MySQL, installed for you in Docker, with phpMyAdmin to see it',
        mysqlFixed: 'This server always uses MySQL, installed for you in Docker, with phpMyAdmin',
        driverLabel: 'PHP access',
        driverMysqli: 'How PHP talks to MySQL. mysqli: the simplest, already part of PHP',
        driverPdo: 'How PHP talks to MySQL. PDO: also works with other databases',
        languagesLabel: 'Languages',
        langFr: 'Français',
        langEn: 'English',
        langBoth: 'EN + FR',
        langFrText: 'Site in French',
        langEnText: 'Site in English',
        langBothText: 'Two languages, with EN / FR buttons on the site',
        gitTitle: 'Git history',
        gitText: 'Keeps track of every change (git init)',
        editorTitle: 'VS Code + Copilot',
        editorText: 'Installed if missing, with GitHub Copilot and the useful extensions',
        latestTitle: 'Latest versions',
        latestText: 'Always the very latest. Off: the tested versions, safer',
        portsLabel: 'Ports (advanced)',
        portApp: 'Site',
        portApi: 'Server (API)',
        portPma: 'phpMyAdmin',
        portDb: 'MySQL',
        summary: 'Summary',
        summaryProject: 'Project',
        summaryFolder: 'Folder',
        summaryFront: 'Site',
        summaryBack: 'Server',
        summaryDatabase: 'Data',
        summaryLanguages: 'Languages',
        none: 'None',
        noneFront: 'No site: only the server (API)',
        noneBack: 'No server: a simple site, with no data to save',
        noDatabase: 'None',
        custom: 'Custom',
        running: 'Creating',
        starting: 'Starting',
        cancel: 'Cancel',
        cancelConfirm: 'Stop the creation? The folder started will be deleted.',
        runningHint: 'Keep the window open: the creation takes a few minutes.',
        leaveWarning: 'The project is being created.',
        doneTitle: 'Project ready',
        doneText: 'To see your site, click "Start the project". Everything is explained in README.md, at the root of the project.',
        launch: 'Start the project',
        openFolder: 'Open the folder',
        openCode: 'Open in VS Code',
        newProject: 'New project',
        databaseUser: 'MySQL user',
        databasePassword: 'Password',
        copy: 'Copy',
        copied: 'Copied',
        launched: 'The project starts in a new window.',
        failedTitle: 'The creation failed',
        failedText: 'The folder started was deleted. Open the "Log" below to see what went wrong.',
        cancelledTitle: 'Creation cancelled',
        cancelledText: 'Nothing was kept: change your choices and start again.',
        editChoices: 'Change the choices',
        retry: 'Try again',
        showLog: 'Log (details of the creation)',
        errorGeneric: 'Something did not work: {0}',
        errors: {
            'folder not found': 'This folder no longer exists (it may have been moved or deleted)',
            'VS Code not found': 'VS Code cannot be found: install it from code.visualstudio.com',
            'no update': 'No update is available',
            'unknown action': 'Unknown action',
            busy: 'A creation is already running',
        },
        questionTitle: 'DC Scaffold needs your answer',
        yes: 'Yes',
        no: 'No',
        waitingAnswer: 'The creation is waiting for your answer.',
        console: 'Console version',
        consoleTitle: 'Opens DC Scaffold in a PowerShell window, text only',
        consoleOpened: 'The console version opens in a new window.',
    },
}

// Two letters for the square of each stack (custom stacks: the first letters of their label)
const MARKS = {
    nuxt: 'NU', next: 'NX', sveltekit: 'SK', vue: 'VU', react: 'RE', svelte: 'SV', solid: 'SO', angular: 'NG', qwik: 'QW', astro: 'AS', vanilla: 'JS',
    slim: 'SL', laravel: 'LA', symfony: 'SY', php: 'PHP', nitro: 'NI', express: 'EX', nest: 'NE', adonis: 'AD', none: '—',
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const state = {
    info: null,
    lang: 'fr',
    step: 0,
    name: '',
    destination: '',
    front: '',
    back: '',
    database: 'mysql',
    driver: '',
    languages: '',
    git: true,
    editor: true,
    useLatest: false,
    ports: { app: 0, api: 8000, pma: 8081, db: 3306 },
    error: '',
    run: null,
}

const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]
const content = $('[data-content]')

function t(key, ...values) {
    let text = TEXTS[state.lang][key] ?? TEXTS.en[key] ?? key
    // errorGeneric: the known messages of DCScaffold.exe are translated
    if (key === 'errorGeneric') values = values.map((value) => TEXTS[state.lang].errors[String(value).replace(/^409 /, '').trim()] ?? value)
    return typeof text === 'string' ? text.replace(/\{(\d)\}/g, (_, i) => values[i] ?? '') : text
}

function escape(text) {
    return String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

// Calls DCScaffold.exe with the token of this run
async function api(path, body) {
    const response = await fetch(path, {
        method: body === undefined ? 'GET' : 'POST',
        headers: { 'X-DCS-Token': token, 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`${response.status} ${await response.text()}`)
    return response.json()
}

// Same folder name as the engine: no accents, lowercase, words joined by "-"
function slugify(name) {
    return name.replace(/["`]/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const stack = (kind, id) => state.info[kind].find((item) => item.id === id)
const localized = (value) => (value && typeof value === 'object' ? value[state.lang] ?? value.en : value ?? '')
const labelOf = (item) => (item.id === 'none' ? t('none') : item.label)
const projectFolder = () => {
    const destination = state.destination.replace(/[\\/]+$/, '')
    return destination + state.info.separator + slugify(state.name)
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

const STEPS = [renderProject, () => renderStacks('fronts'), () => renderStacks('backs'), renderOptions, renderRun]

let renderedStep = -1

function render() {
    document.documentElement.lang = state.lang
    $$('[data-text]').forEach((element) => { element.textContent = t(element.dataset.text) })
    $$('[data-lang]').forEach((button) => button.classList.toggle('active', button.dataset.lang === state.lang))
    $('[data-version]').textContent = `${t('version')} ${state.info.version}`
    $('[data-console]').hidden = !state.info.hasConsole
    $('[data-console]').title = t('consoleTitle')
    renderStepper()
    // Each step is a page of the history: the "back" button of the mouse (or Alt + left arrow) goes to the previous step
    if (history.state?.step !== state.step) history.pushState({ step: state.step }, '')
    content.innerHTML = STEPS[state.step]()
    // The entrance animation only plays when the step changes, not on every click
    if (renderedStep === state.step && !state.run?.ended) content.firstElementChild.style.animation = 'none'
    if (renderedStep !== state.step) content.scrollTop = 0
    renderedStep = state.step
    bindStep()
    renderBottomBar()
}

function renderStepper() {
    const running = state.run && !state.run.ended
    $('[data-stepper]').innerHTML = t('steps').map((name, index) => {
        const status = index === state.step ? 'current' : index < state.step ? 'done' : ''
        const reachable = !running && index < state.step && state.step < 4
        return `<li class="${status}"><button type="button" data-goto="${index}" ${reachable ? '' : 'disabled'}>
            <span>0${index + 1}</span><em>${escape(name)}</em></button></li>`
    }).join('')
}

function head(index, title, text) {
    return `<div class="step-head">
        <p class="eyebrow"><b>${t('step')} 0${index + 1}</b> / 05</p>
        <h2 class="step-title">${escape(title)}</h2>
        <p class="step-text">${escape(text)}</p>
    </div>`
}

function errorBox() {
    return state.error ? `<p class="error" role="alert">${escape(state.error)}</p>` : ''
}

function renderProject() {
    return `<section class="step">
        ${head(0, t('projectTitle'), t('projectText'))}
        <div class="fields">
            <label class="field">
                <span class="field-label">${t('nameLabel')}</span>
                <input class="input input-big" data-field="name" value="${escape(state.name)}" placeholder="${escape(t('namePlaceholder'))}" maxlength="80" autocomplete="off" spellcheck="false">
            </label>
            <div class="field">
                <span class="field-label">${t('destinationLabel')}</span>
                <div class="input-row">
                    <input class="input" data-field="destination" value="${escape(state.destination)}" spellcheck="false">
                    ${state.info.canBrowse ? `<button type="button" class="btn" data-browse>${t('browse')}</button>` : ''}
                </div>
                <p class="path-preview">${t('folderPreview')} <strong data-folder>${escape(slugify(state.name) ? projectFolder() : '')}</strong></p>
            </div>
            ${errorBox()}
        </div>
    </section>`
}

function stackTags(kind, item) {
    const tags = []
    if (kind === 'fronts') {
        if (item.port) tags.push(`:${item.port}`)
        if ((item.requires ?? []).includes('node')) tags.push('Node.js')
        if (item.docker) tags.push('Docker')
    } else if (item.id !== 'none') {
        tags.push(item.runtime === 'php' ? 'PHP · Docker' : 'Node.js')
        if (item.database === true) tags.push('MySQL')
        if (item.database === 'optional') tags.push(`MySQL / ${item.fallbackDatabase ?? 'SQLite'}`)
    }
    if (item.custom) tags.push(t('custom'))
    return tags.map((tag) => `<span class="tag">${escape(tag)}</span>`).join('')
}

function renderStacks(kind) {
    const front = kind === 'fronts'
    const chosen = front ? state.front : state.back
    const cards = state.info[kind].map((item) => {
        const mark = MARKS[item.id] ?? item.label.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase()
        const text = item.id === 'none' ? t(front ? 'noneFront' : 'noneBack') : localized(item.description)
        return `<button type="button" class="card ${chosen === item.id ? 'selected' : ''}" data-pick="${escape(item.id)}">
            <span class="card-check"></span>
            <span class="card-mark">${escape(mark)}</span>
            <span class="card-label">${escape(labelOf(item))}</span>
            <span class="card-text">${escape(text)}</span>
            <span class="card-tags">${stackTags(kind, item)}</span>
        </button>`
    }).join('')
    return `<section class="step">
        ${head(front ? 1 : 2, t(front ? 'frontTitle' : 'backTitle'), t(front ? 'frontText' : 'backText'))}
        <div class="cards">${cards}</div>
        ${errorBox()}
    </section>`
}

// Buttons side by side, one of them chosen (database, PHP access, languages), with the text of the chosen one below
function segmented(group, label, items, current) {
    const chosen = items.find((item) => item.value === current) ?? items[0]
    return `<div class="option-group">
        <span class="field-label">${escape(label)}</span>
        <div>
            <div class="segmented" role="radiogroup" aria-label="${escape(label)}">
                ${items.map((item) => `<button type="button" role="radio" aria-checked="${item.value === chosen.value}" class="${item.value === chosen.value ? 'selected' : ''}"
                    data-choice="${group}" data-value="${escape(item.value)}">${escape(item.label)}</button>`).join('')}
            </div>
            <p class="option-hint">${escape(chosen.text)}</p>
        </div>
    </div>`
}

// Always the same choice with this server (MySQL for PHP): shown, not chosen
function fixedOption(label, value, text) {
    return `<div class="option-group">
        <span class="field-label">${escape(label)}</span>
        <div><p class="option-fixed">${escape(value)}</p><p class="option-hint">${escape(text)}</p></div>
    </div>`
}

function switchRow(name, title, text) {
    return `<div class="switch-row" data-switch="${name}" role="switch" aria-checked="${state[name]}" tabindex="0">
        <strong>${escape(title)}</strong>
        <span class="switch ${state[name] ? 'on' : ''}"></span>
        <small>${escape(text)}</small>
    </div>`
}

// What the chosen stacks allow
function options() {
    const front = stack('fronts', state.front)
    const back = stack('backs', state.back)
    const hasFront = state.front !== 'none'
    const hasBack = state.back !== 'none'
    const databaseKind = hasBack ? back.database : false
    const hasDatabase = databaseKind === true || (databaseKind === 'optional' && state.database === 'mysql')
    const drivers = (back?.drivers ?? []).filter(Boolean)
    return { front, back, hasFront, hasBack, databaseKind, hasDatabase, drivers, nodeBack: back?.runtime === 'node' }
}

function languageValue(code) {
    return code === 'both' ? (state.lang === 'en' ? 'en,fr' : 'fr,en') : code
}

function renderOptions() {
    const o = options()
    const mysql = `MySQL ${state.info.mysql}`
    let database = ''
    if (o.databaseKind === true) {
        database = fixedOption(t('databaseLabel'), mysql, t('mysqlFixed'))
    } else if (o.databaseKind === 'optional') {
        database = segmented('database', t('databaseLabel'), [
            { value: 'mysql', label: mysql, text: t('mysqlText') },
            { value: 'sqlite', label: o.back.fallbackDatabase ?? 'SQLite', text: localized(o.back.noDatabase) },
        ], state.database)
    }
    const driver = o.hasDatabase && o.drivers.length > 1 ? segmented('driver', t('driverLabel'),
        o.drivers.map((name) => ({ value: name, label: name === 'pdo' ? 'PDO' : name, text: t(name === 'pdo' ? 'driverPdo' : 'driverMysqli') })), state.driver) : ''
    const languages = o.hasFront ? segmented('languages', t('languagesLabel'), [
        { value: languageValue('fr'), label: t('langFr'), text: t('langFrText') },
        { value: languageValue('en'), label: t('langEn'), text: t('langEnText') },
        { value: languageValue('both'), label: t('langBoth'), text: t('langBothText') },
    ], state.languages) : ''

    return `<section class="step">
        ${head(3, t('optionsTitle'), t('optionsText'))}
        <div class="options">
            <div class="option-list">
                ${database}${driver}${languages}
                <div class="switches">
                    ${switchRow('git', t('gitTitle'), t('gitText'))}
                    ${switchRow('editor', t('editorTitle'), t('editorText'))}
                    ${switchRow('useLatest', t('latestTitle'), t('latestText'))}
                </div>
                ${renderPorts(o)}
            </div>
            ${renderSummary(o)}
        </div>
        ${errorBox()}
    </section>`
}

// Ports, under the switches: closed by default (the usual ports suit most computers)
function renderPorts(o) {
    const ports = [
        o.hasFront && ['app', t('portApp')],
        o.hasBack && ['api', t('portApi')],
        o.hasDatabase && ['pma', t('portPma')],
        o.hasDatabase && o.nodeBack && ['db', t('portDb')],
    ].filter(Boolean)
    if (!ports.length) return ''
    return `<details class="ports-box" data-ports>
        <summary class="field-label">${t('portsLabel')}</summary>
        <div class="ports">${ports.map(([key, label]) => `<label class="field">
            <span class="field-label">${escape(label)}</span>
            <input class="input" type="number" min="1" max="65535" data-port="${key}" value="${state.ports[key]}">
        </label>`).join('')}</div>
    </details>`
}

function renderSummary(o) {
    const database = !o.hasBack ? null
        : o.hasDatabase ? `MySQL ${state.info.mysql}${o.drivers.length > 1 ? ` (${state.driver === 'pdo' ? 'PDO' : state.driver})` : ''}`
            : o.back.fallbackDatabase ?? t('noDatabase')
    const languages = { fr: 'Français', en: 'English', 'fr,en': 'Français + English', 'en,fr': 'English + Français' }
    const rows = [
        [t('summaryProject'), state.name],
        [t('summaryFolder'), projectFolder(), 'mono'],
        [t('summaryFront'), labelOf(o.front)],
        [t('summaryBack'), labelOf(o.back)],
        database && [t('summaryDatabase'), database],
        o.hasFront && [t('summaryLanguages'), languages[state.languages]],
    ].filter(Boolean)
    return `<aside class="summary">
        <h3>${t('summary')}</h3>
        <dl>${rows.map(([label, value, kind]) => `<div><dt>${escape(label)}</dt><dd class="${kind ?? ''}" title="${escape(value)}">${kind === 'mono' ? `<bdi>${escape(value)}</bdi>` : escape(value)}</dd></div>`).join('')}</dl>
    </aside>`
}

// ---------------------------------------------------------------------------
// Creation
// ---------------------------------------------------------------------------

function renderRun() {
    const run = state.run
    if (run.ended) return renderResult(run)
    const counter = String(run.step || 0).padStart(2, '0')
    return `<section class="step run">
        <div class="run-head">
            <div>
                <p class="eyebrow"><b>${t('running')}</b> · ${escape(state.name)}</p>
                <h2 class="run-title" data-run-title>${escape(run.title || t('starting'))}</h2>
            </div>
            <p class="run-counter"><span data-run-counter>${counter}</span><small>/08</small></p>
        </div>
        <div class="progress working"><span data-run-bar style="width:${(run.step / 8) * 100}%"></span></div>
        <div class="log" data-log></div>
    </section>`
}

function renderResult(run) {
    const ok = run.code === 0 && run.result
    if (!ok) {
        const lines = run.lines.filter((line) => /\[X\]/.test(line)).slice(-4)
        return `<section class="step result failed">
            <div class="step-head">
                <p class="eyebrow"><b>${escape(state.name)}</b></p>
                <h2 class="result-title">${t(run.cancelled ? 'cancelledTitle' : 'failedTitle')}</h2>
            </div>
            <p class="step-text">${t(run.cancelled ? 'cancelledText' : 'failedText')}</p>
            ${lines.length ? `<div class="error">${lines.map((line) => escape(line.replace(/^\s*\[X\]\s*/, ''))).join('<br>')}</div>` : ''}
            <div class="actions">
                <button type="button" class="btn btn-primary" data-action="retry">${t('retry')}</button>
                <button type="button" class="btn" data-action="edit">${t('editChoices')}</button>
            </div>
            <details><summary class="field-label">${t('showLog')}</summary><div class="log" data-log style="max-height:340px"></div></details>
        </section>`
    }

    const result = run.result
    const rows = (result.urls ?? []).map((item) => [item.label, item.url])
    if (result.database) {
        rows.push([t('databaseUser'), result.database.user])
        rows.push([t('databasePassword'), result.database.password])
    }
    return `<section class="step result">
        <div class="step-head">
            <p class="eyebrow"><b>${escape(result.stack)}</b></p>
            <h2 class="result-title">${t('doneTitle')}</h2>
        </div>
        <p class="result-path">${escape(result.root)}</p>
        ${rows.length ? `<dl class="result-grid">${rows.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>` : ''}
        <p class="step-text">${t('doneText')}</p>
        <div class="actions">
            <button type="button" class="btn btn-primary" data-action="start">${t('launch')}</button>
            <button type="button" class="btn" data-action="folder">${t('openFolder')}</button>
            ${state.info.hasCode || result.code ? `<button type="button" class="btn" data-action="code">${t('openCode')}</button>` : ''}
            ${result.database ? `<button type="button" class="btn" data-action="copy">${t('copy')} : ${t('databasePassword')}</button>` : ''}
        </div>
        <details><summary class="field-label">${t('showLog')}</summary><div class="log" data-log style="max-height:340px"></div></details>
    </section>`
}

// Colors of the log, from the markers of the engine ([OK], [!], [X], titles...)
function lineClass(line) {
    if (/\[X\]/.test(line)) return 'fail'
    if (/\[!\]/.test(line)) return 'warn'
    if (/\[OK\]/.test(line)) return 'ok'
    if (/^\s*──/.test(line)) return 'title'
    if (/^\s{4}[+~] /.test(line)) return 'file'
    if (/^\s{5,}\S/.test(line) || /[╔║╚]/.test(line)) return 'info'
    return 'plain'
}

function appendLog(lines) {
    const log = $('[data-log]')
    if (!log) return
    const stick = log.scrollTop + log.clientHeight >= log.scrollHeight - 30
    const fragment = document.createDocumentFragment()
    for (const line of lines) {
        // No empty lines at the top of the log
        if (!line.trim() && !log.childElementCount && !fragment.childElementCount) continue
        const div = document.createElement('div')
        div.className = lineClass(line)
        div.textContent = line || ' '
        fragment.append(div)
    }
    log.append(fragment)
    while (log.childElementCount > 4000) log.firstElementChild.remove()
    if (stick) log.scrollTop = log.scrollHeight
}

function payload() {
    const o = options()
    return {
        lang: state.lang,
        name: state.name.trim(),
        destination: state.destination.trim(),
        front: state.front,
        back: state.back,
        database: o.databaseKind === 'optional' ? state.database : '',
        driver: o.hasDatabase && o.drivers.length > 1 ? state.driver : '',
        languages: o.hasFront ? state.languages : '',
        appPort: o.hasFront ? state.ports.app : 0,
        apiPort: o.hasBack ? state.ports.api : 0,
        pmaPort: o.hasDatabase ? state.ports.pma : 0,
        dbPort: o.hasDatabase && o.nodeBack ? state.ports.db : 0,
        git: state.git,
        editor: state.editor,
        useLatest: state.useLatest,
    }
}

async function startRun() {
    const answer = await api('/api/create', payload())
    if (answer.error) throw new Error(answer.error)
    state.run = { step: 0, title: '', lines: [], ended: false, code: null, result: null, cancelled: false, questions: {} }
    state.step = 4
    render()

    let pending = []
    const flush = () => {
        if (pending.length) appendLog(pending)
        pending = []
    }
    const source = new EventSource(`/api/events?token=${token}&from=0`)
    source.onmessage = (message) => {
        const event = JSON.parse(message.data)
        const run = state.run
        if (event.type === 'line') {
            run.lines.push(event.text)
            pending.push(event.text)
            if (pending.length === 1) requestAnimationFrame(flush)
        } else if (event.type === 'step') {
            run.step = event.step
            run.title = event.title
            $('[data-run-title]').textContent = event.title
            $('[data-run-counter]').textContent = String(event.step).padStart(2, '0')
            $('[data-run-bar]').style.width = `${(event.step / 8) * 100}%`
        } else if (event.type === 'question') {
            run.questions[event.id] = event
            showQuestion()
        } else if (event.type === 'answered') {
            delete run.questions[event.id]
            showQuestion()
        } else if (event.type === 'done') {
            run.result = event
        } else if (event.type === 'end') {
            source.close()
            run.questions = {}
            showQuestion()
            flush()
            run.ended = true
            run.code = event.code
            run.cancelled = Boolean(event.cancelled)
            render()
            appendLog(run.lines)
        }
    }
}

// Question of the engine (install a tool, update Node.js, new major version...): the creation waits for the answer.
// The suggested answer is the highlighted button.
function showQuestion() {
    $('.question')?.remove()
    const question = Object.values(state.run?.questions ?? {})[0]
    document.title = question ? `(?) DC Scaffold` : 'DC Scaffold'
    if (state.step === 4 && !state.run?.ended) $('[data-hint]').textContent = t(question ? 'waitingAnswer' : 'runningHint')
    if (!question) return

    // Context: the last lines of the log (versions found, why the question is asked)
    const context = state.run.lines.filter((line) => line.trim()).slice(-3).map((line) => line.trim())
    const box = document.createElement('div')
    box.className = 'question'
    box.innerHTML = `<div class="question-panel" role="dialog" aria-modal="true">
        <p class="eyebrow"><b>${t('questionTitle')}</b></p>
        <pre class="question-context">${context.map((line) => `<span class="${lineClass(line)}">${escape(line)}</span>`).join('\n')}</pre>
        <p class="question-text">${escape(question.text)}</p>
        <div class="actions">
            <button type="button" class="btn ${question.default ? 'btn-primary' : ''}" data-answer="yes">${t('yes')}</button>
            <button type="button" class="btn ${question.default ? '' : 'btn-primary'}" data-answer="no">${t('no')}</button>
        </div>
    </div>`
    document.body.append(box)
    box.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', async () => {
        box.querySelectorAll('button').forEach((item) => { item.disabled = true })
        const answer = await api('/api/answer', { id: question.id, yes: button.dataset.answer === 'yes' }).catch((error) => ({ error: error.message }))
        if (answer.error) {
            box.querySelectorAll('button').forEach((item) => { item.disabled = false })
            toast(t('errorGeneric', answer.error))
        }
    }))
    box.querySelector('.btn-primary').focus()
}

// Logo: the site of the author, opened in the default browser by DCScaffold.exe
$('[data-author]').addEventListener('click', async (event) => {
    event.preventDefault()
    const answer = await api('/api/author', {}).catch((error) => ({ error: error.message }))
    if (answer.error) toast(t('errorGeneric', answer.error))
})

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function renderBottomBar() {
    const bar = $('[data-bottombar]')
    const back = $('[data-back]')
    const next = $('[data-next]')
    const hint = $('[data-hint]')
    const run = state.run

    if (state.step === 4) {
        bar.hidden = run.ended
        back.hidden = true
        next.textContent = t('cancel')
        next.className = 'btn btn-danger'
        hint.textContent = t('runningHint')
        return
    }
    bar.hidden = false
    back.hidden = state.step === 0
    next.className = 'btn btn-primary'
    next.textContent = state.step === 3 ? t('create') : t('next')
    hint.textContent = ''
}

async function goNext() {
    state.error = ''
    try {
        if (state.step === 0) {
            if (!slugify(state.name)) return fail(t('errorName'))
            const check = await api('/api/check', { destination: state.destination.trim(), slug: slugify(state.name) })
            if (!check.destination) return fail(t('errorDestination', state.destination))
            if (check.folderUsed) return fail(t('errorUsed', check.folder))
        }
        if (state.step === 1 && !state.front) return
        if (state.step === 2) {
            if (!state.back) return
            if (state.front === 'none' && state.back === 'none') return fail(t('errorNothing'))
            prepareOptions()
        }
        if (state.step === 3) return await startRun()
        state.step++
        render()
        if (state.step === 0) $('[data-field="name"]')?.focus()
    } catch (error) {
        fail(t('errorGeneric', error.message))
    }
}

function fail(message) {
    state.error = message
    render()
}

// Defaults for the chosen stacks: port of the framework, first driver, languages of the window
function prepareOptions() {
    const o = options()
    state.ports.app = o.front?.port ?? 3000
    if (!o.drivers.includes(state.driver)) state.driver = o.drivers[0] ?? ''
    if (!state.languages) state.languages = state.lang
    if (o.databaseKind !== 'optional') state.database = 'mysql'
}

function bindStep() {
    const name = $('[data-field="name"]')
    if (name) {
        name.addEventListener('input', () => {
            state.name = name.value
            if (state.error) {
                state.error = ''
                $('.error')?.remove()
            }
            $('[data-folder]').textContent = slugify(state.name) ? projectFolder() : ''
        })
        if (!state.name) name.focus()
    }
    const destination = $('[data-field="destination"]')
    destination?.addEventListener('input', () => {
        state.destination = destination.value
        $('[data-folder]').textContent = slugify(state.name) ? projectFolder() : ''
    })
    // Folder picker of Windows; if it cannot open, the path can still be typed in the field
    $('[data-browse]')?.addEventListener('click', async (event) => {
        event.currentTarget.disabled = true
        const answer = await api('/api/browse', { start: state.destination, title: t('browseTitle') })
            .catch((error) => ({ error: error.message }))
        $('[data-browse]').disabled = false
        if (answer.error) {
            toast(t('browseFailed'))
            return $('[data-field="destination"]').focus()
        }
        if (answer.path) {
            state.destination = answer.path
            render()
        }
    })

    $$('[data-pick]').forEach((card) => card.addEventListener('click', () => {
        if (state.step === 1) state.front = card.dataset.pick
        else state.back = card.dataset.pick
        state.error = ''
        render()
    }))
    $$('[data-pick]').forEach((card) => card.addEventListener('dblclick', goNext))

    $$('[data-choice]').forEach((button) => button.addEventListener('click', () => {
        state[button.dataset.choice] = button.dataset.value
        render()
    }))
    $$('[data-switch]').forEach((row) => {
        const toggle = () => {
            state[row.dataset.switch] = !state[row.dataset.switch]
            render()
        }
        row.addEventListener('click', toggle)
        row.addEventListener('keydown', (event) => (event.key === ' ' || event.key === 'Enter') && (event.preventDefault(), toggle()))
    })
    $$('[data-port]').forEach((input) => input.addEventListener('input', () => {
        state.ports[input.dataset.port] = Number(input.value) || 0
    }))
    $('[data-ports]')?.addEventListener('toggle', (event) => {
        state.portsOpen = event.target.open
        // Opened: the inputs come into view (they are the last thing of the step)
        if (event.target.open) event.target.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
    if (state.portsOpen) $('[data-ports]')?.setAttribute('open', '')

    $$('[data-action]').forEach((button) => button.addEventListener('click', () => resultAction(button.dataset.action)))
}

async function resultAction(action) {
    const run = state.run
    if (action === 'edit' || action === 'new') {
        state.run = null
        state.step = action === 'edit' ? 3 : 0
        if (action === 'new') Object.assign(state, { name: '', front: '', back: '' })
        return render()
    }
    if (action === 'retry') {
        state.step = 3
        return goNext()
    }
    if (action === 'copy') {
        await navigator.clipboard.writeText(run.result.database.password)
        return toast(t('copied'))
    }
    const answer = await api('/api/open', { action, path: run.result.root })
    if (answer.error) return toast(t('errorGeneric', answer.error))
    if (action === 'start') toast(t('launched'))
}

function toast(message) {
    $('.toast')?.remove()
    const element = document.createElement('div')
    element.className = 'toast'
    element.textContent = message
    document.body.append(element)
    setTimeout(() => element.remove(), 3500)
}

$('[data-next]').addEventListener('click', async () => {
    if (state.step === 4) {
        if (confirm(t('cancelConfirm'))) await api('/api/cancel', {})
        return
    }
    goNext()
})
$('[data-console]').addEventListener('click', async () => {
    const answer = await api('/api/console', {}).catch((error) => ({ error: error.message }))
    toast(answer.error ? t('errorGeneric', answer.error) : t('consoleOpened'))
})
$('[data-back]').addEventListener('click', () => {
    state.error = ''
    state.step = Math.max(0, state.step - 1)
    render()
})
$('[data-stepper]').addEventListener('click', (event) => {
    const button = event.target.closest('[data-goto]')
    if (!button || button.disabled) return
    state.error = ''
    state.step = Number(button.dataset.goto)
    render()
})
$$('[data-lang]').forEach((button) => button.addEventListener('click', () => {
    // "Two languages" follows the window: FR + EN in French, EN + FR in English
    const both = state.languages.includes(',')
    state.lang = button.dataset.lang
    if (both) state.languages = languageValue('both')
    api('/api/settings', { lang: state.lang }).catch(() => {})
    render()
}))
addEventListener('popstate', (event) => {
    // During the creation, stay on the creation
    if (state.run && !state.run.ended) return history.pushState({ step: state.step }, '')
    const step = event.state?.step ?? 0
    if (step < 4) state.run = null
    state.step = state.run ? 4 : Math.min(step, 3)
    state.error = ''
    render()
})
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && state.step < 4 && !$('.question') && !event.target.closest('button, a, [data-switch]')) goNext()
})

// ---------------------------------------------------------------------------
// Window life: a connection kept open (DCScaffold.exe stops a little after the window is closed), update, start
// ---------------------------------------------------------------------------

new EventSource(`/api/alive?token=${token}`)
addEventListener('beforeunload', (event) => {
    if (state.run && !state.run.ended) {
        event.preventDefault()
        event.returnValue = t('leaveWarning')
    }
})
document.addEventListener('contextmenu', (event) => {
    if (!event.target.closest('input, .log, .result-path, .result-grid')) event.preventDefault()
})

async function checkUpdate() {
    const update = await api('/api/update').catch(() => null)
    if (!update?.available) return
    $('[data-update-version]').textContent = update.latest
    $('[data-update]').hidden = false
    $('[data-update-install]').addEventListener('click', async (event) => {
        event.target.disabled = true
        const answer = await api('/api/update', {}).catch((error) => ({ error: error.message }))
        if (answer.error) {
            event.target.disabled = false
            return toast(t('errorGeneric', answer.error))
        }
        toast(t('updateStarting'))
        setTimeout(() => window.close(), 2500)
    })
}

async function start() {
    history.replaceState({ step: 0 }, '')
    state.info = await api('/api/info')
    state.lang = state.info.lang
    state.destination = state.info.destination
    render()
    setTimeout(checkUpdate, 2500)
}

start().catch((error) => {
    content.innerHTML = `<p class="error">${escape(error.message)}</p>`
})
