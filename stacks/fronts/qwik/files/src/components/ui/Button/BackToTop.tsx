import { $, component$, useOnWindow, useSignal } from '@builder.io/qwik'
import FloatingButton from '~/components/ui/Button/FloatingButton'
import { useLang } from '~/composables/useLang'
import { t } from '~/plugins/lang'

// Scroll distance (in pixels) after which the button shows
const SHOW_AFTER = 400

// Shown once the visitor scrolled down, brings them back to the top
export default component$(() => {
    const lang = useLang()
    const visible = useSignal(false)

    useOnWindow('scroll', $(() => {
        visible.value = window.scrollY > SHOW_AFTER
    }))

    if (!visible.value) return <span hidden />
    return (
        <FloatingButton aria-label={t(lang, 'backToTop')} title={t(lang, 'backToTop')}
            onClick$={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</FloatingButton>
    )
})
