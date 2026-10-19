// Floating button: className, aria-label and onClick are passed through
export default function FloatingButton({ className = '', children, ...props }) {
    return (
        <button type="button" className={`floating-btn ${className}`.trim()} {...props}>
            {children}
        </button>
    )
}
