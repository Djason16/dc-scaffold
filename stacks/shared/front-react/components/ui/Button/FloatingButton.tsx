import type { ButtonHTMLAttributes } from 'react'
// Floating button: className, aria-label and onClick are passed through
export default function FloatingButton({ className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button type="button" className={`floating-btn ${className}`.trim()} {...props}>
            {children}
        </button>
    )
}
