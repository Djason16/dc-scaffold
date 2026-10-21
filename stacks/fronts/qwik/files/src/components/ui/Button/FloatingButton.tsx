import { component$, Slot, type PropsOf } from '@builder.io/qwik'

// Floating button: class, aria-label and onClick$ are passed through
export default component$(({ class: className = '', ...props }: PropsOf<'button'>) => (
    <button type="button" class={`floating-btn ${className}`.trim()} {...props}>
        <Slot />
    </button>
))
