import { lang } from '../../../plugins/lang.js'
import { floatingButton } from './floatingButton.js'

// Scroll distance (in pixels) after which the button shows
const SHOW_AFTER = 400

// Button inside <div data-back-to-top>: shown once the visitor scrolled down, brings them back to the top
export const mountBackToTop = (container) => {
    const render = () => container.replaceChildren(...(window.scrollY > SHOW_AFTER ? [floatingButton({
        label: '↑',
        ariaLabel: lang.getTranslation('backToTop'),
        onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    })] : []))

    let shown = null
    window.addEventListener('scroll', () => {
        const visible = window.scrollY > SHOW_AFTER
        if (visible !== shown) { shown = visible; render() }
    }, { passive: true })
    // @two-languages
    // Drawn again in the new language
    lang.onChange(render)
    // @end-two-languages
}
