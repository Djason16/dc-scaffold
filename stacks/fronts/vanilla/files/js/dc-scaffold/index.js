// Design of DC Scaffold, loaded by js/main.js while design is true in dc-scaffold.config.js
// @two-languages
// Its texts, added to the ones of plugins/translations
import './texts/index.js'
// @end-two-languages

// Welcome page of DC Scaffold, in place of the sections of the home page (<main data-home> of pages/index.html)
const home = document.querySelector('main[data-home]')
if (home) home.innerHTML = `
    <section class="section">
        <div class="container">
            <div class="page-hero page-hero-large">
                <span class="hero-badge">
                    <img src="/dc-scaffold/icon.png" alt="" width="28" height="28">
                    <span data-i18n="heroBadge"></span>
                </span>
                <h1 data-i18n="heroTitle">{{PROJECT_NAME}}</h1>
                <p class="page-hero-text" data-i18n="heroText"></p>
                <div class="page-hero-actions">
                    <div class="hero-by">
                        <span data-i18n="heroBy"></span>
                        <a class="hero-by-link" href="https://djason-chery.dev/" target="_blank" rel="noopener">
                            <img src="/dc-scaffold/logo-light.png" alt="Djason CHERY" width="114" height="32">
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- "What next?" section (texts in js/dc-scaffold/texts/nextSteps.js) -->
    <section class="section">
        <div class="container next-steps">
            <div class="next-steps-header">
                <h2 data-i18n="nextStepsTitle"></h2>
                <p data-i18n="nextStepsText"></p>
            </div>
            <ol class="next-steps-list">
                <li class="next-steps-card"><span>01</span><h3 data-i18n="nextStepDesignTitle"></h3><p data-i18n="nextStepDesignText"></p></li>
                <li class="next-steps-card"><span>02</span><h3 data-i18n="nextStepTextsTitle"></h3><p data-i18n="nextStepTextsText"></p></li>
                <li class="next-steps-card"><span>03</span><h3 data-i18n="nextStepPagesTitle"></h3><p data-i18n="nextStepPagesText"></p></li>
            </ol>
        </div>
    </section>
`
