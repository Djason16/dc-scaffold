import { useLang } from '@/composables/useLang.js'

// "What next?" section of DC Scaffold: three cards (texts in dc-scaffold/texts/nextSteps.js)
export default function NextSteps() {
    const { getTranslation: t } = useLang()

    return (
        <div class="next-steps">
            <div class="next-steps-header">
                <h2>{t('nextStepsTitle')}</h2>
                <p>{t('nextStepsText')}</p>
            </div>
            <ol class="next-steps-list">
                <li class="next-steps-card">
                    <span>01</span>
                    <h3>{t('nextStepDesignTitle')}</h3>
                    <p>{t('nextStepDesignText')}</p>
                </li>
                <li class="next-steps-card">
                    <span>02</span>
                    <h3>{t('nextStepTextsTitle')}</h3>
                    <p>{t('nextStepTextsText')}</p>
                </li>
                <li class="next-steps-card">
                    <span>03</span>
                    <h3>{t('nextStepPagesTitle')}</h3>
                    <p>{t('nextStepPagesText')}</p>
                </li>
            </ol>
        </div>
    )
}
