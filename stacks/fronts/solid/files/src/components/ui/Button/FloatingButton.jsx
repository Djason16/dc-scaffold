import { splitProps } from 'solid-js'

// Floating button: class, aria-label and onClick go to the <button>
export default function FloatingButton(props) {
    const [own, rest] = splitProps(props, ['class', 'children'])
    return (
        <button type="button" class={`floating-btn ${own.class ?? ''}`.trim()} {...rest}>
            {own.children}
        </button>
    )
}
