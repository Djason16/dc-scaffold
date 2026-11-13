import type { ComponentType } from 'react'

// Each component of "sections" in its own <section>, in order
export default function SectionLayout({ sections }: { sections: ComponentType[] }) {
    return sections.map((Section, index) => (
        <section key={index} className="section">
            <div className="container">
                <Section />
            </div>
        </section>
    ))
}
