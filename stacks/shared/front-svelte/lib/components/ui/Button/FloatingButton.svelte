<script lang="ts">
    import type { Snippet } from 'svelte'
    import type { HTMLButtonAttributes } from 'svelte/elements'

    // Floating button: class, aria-label and onclick are passed through
    let { children, class: className = '', ...attributes }: HTMLButtonAttributes & { children?: Snippet } = $props()
</script>

<button type="button" class="floating-btn {className}" {...attributes}>
    {@render children?.()}
</button>
