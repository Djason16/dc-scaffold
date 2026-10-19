import { Component } from '@angular/core'
import { useLang } from '@/composables/useLang'

// "What next?" section of DC Scaffold: three cards (texts in dc-scaffold/texts/nextSteps.js)
@Component({
    selector: 'app-next-steps',
    template: `
        <div class="next-steps">
            <div class="next-steps-header">
                <h2>{{ lang.getTranslation('nextStepsTitle') }}</h2>
                <p>{{ lang.getTranslation('nextStepsText') }}</p>
            </div>
            <ol class="next-steps-list">
                <li class="next-steps-card">
                    <span>01</span>
                    <h3>{{ lang.getTranslation('nextStepDesignTitle') }}</h3>
                    <p>{{ lang.getTranslation('nextStepDesignText') }}</p>
                </li>
                <li class="next-steps-card">
                    <span>02</span>
                    <h3>{{ lang.getTranslation('nextStepTextsTitle') }}</h3>
                    <p>{{ lang.getTranslation('nextStepTextsText') }}</p>
                </li>
                <li class="next-steps-card">
                    <span>03</span>
                    <h3>{{ lang.getTranslation('nextStepPagesTitle') }}</h3>
                    <p>{{ lang.getTranslation('nextStepPagesText') }}</p>
                </li>
            </ol>
        </div>
    `,
})
export class NextSteps {
    protected lang = useLang()
}
