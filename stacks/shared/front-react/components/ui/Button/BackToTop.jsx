import { useEffect, useState } from 'react'
import FloatingButton from '@/components/ui/Button/FloatingButton.jsx'
import { useLang } from '@/composables/useLang.js'

// Scroll distance (in pixels) after which the button shows
const SHOW_AFTER = 400

// Shown once the visitor scrolled down, brings them back to the top
export default function BackToTop() {
    const { getTranslation: t } = useLang()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > SHOW_AFTER)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    if (!visible) return null
    return (
        <FloatingButton aria-label={t('backToTop')} title={t('backToTop')}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</FloatingButton>
    )
}
