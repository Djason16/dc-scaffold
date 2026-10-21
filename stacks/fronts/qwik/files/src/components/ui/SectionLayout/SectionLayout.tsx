import { component$, type Component } from '@builder.io/qwik'

// Each component of "sections" in its own <section>, in order
export default component$((props: { sections: Component[] }) => (
    <>
        {props.sections.map((Section, index) => (
            <section key={index} class="section">
                <div class="container">
                    <Section />
                </div>
            </section>
        ))}
    </>
))
