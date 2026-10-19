<script>
    // Floating button: class, aria-label and onclick are passed through
    let { children, class: className = '', ...attributes } = $props()
</script>

<button type="button" class="floating-btn {className}" {...attributes}>
    {@render children?.()}
</button>
