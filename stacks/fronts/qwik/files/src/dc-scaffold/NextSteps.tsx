import { component$ } from '@builder.io/qwik'
import { useLang } from '~/composables/useLang'
import { t } from '~/plugins/lang'

// "What next?" section of DC Scaffold: three cards (texts in dc-scaffold/texts/nextSteps.js)
export default component$(() => {
    const lang = useLang()

    return (
        <div class="next-steps">
            <div class="next-steps-header">
                <h2>{t(lang, 'nextStepsTitle')}</h2>
                <p>{t(lang, 'nextStepsText')}</p>
            </div>
            <ol class="next-steps-list">
                <li class="next-steps-card">
                    <span>01</span>
                    <h3>{t(lang, 'nextStepDesignTitle')}</h3>
                    <p>{t(lang, 'nextStepDesignText')}</p>
                </li>
                <li class="next-steps-card">
                    <span>02</span>
                    <h3>{t(lang, 'nextStepTextsTitle')}</h3>
                    <p>{t(lang, 'nextStepTextsText')}</p>
                </li>
                <li class="next-steps-card">
                    <span>03</span>
                    <h3>{t(lang, 'nextStepPagesTitle')}</h3>
                    <p>{t(lang, 'nextStepPagesText')}</p>
                </li>
            </ol>
        </div>
    )
})
