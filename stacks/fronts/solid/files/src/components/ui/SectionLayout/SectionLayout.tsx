import { For, type Component } from 'solid-js'

// Each component of "sections" in its own <section>, in order
export default function SectionLayout(props: { sections: Component[] }) {
    return (
        <For each={props.sections}>
            {(Section) => (
                <section class="section">
                    <div class="container">
                        <Section />
                    </div>
                </section>
            )}
        </For>
    )
}
