<script>
    // Each component of "sections" in its own <section>, in order
    let { sections } = $props()
</script>

{#each sections as Section, index (index)}
    <section class="section">
        <div class="container">
            <Section />
        </div>
    </section>
{/each}
