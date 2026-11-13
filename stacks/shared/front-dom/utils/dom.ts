// Creates an element: h('button', { class: 'btn', onclick: save }, 'Save')
// Props starting with "on" become event listeners, the others attributes (false / null are skipped)
export const h = (tag: string, props: Record<string, any> = {}, ...children: (Node | string | null | undefined | (Node | string | null | undefined)[])[]) => {
    const element = document.createElement(tag)
    for (const [name, value] of Object.entries(props)) {
        if (name.startsWith('on')) element.addEventListener(name.slice(2), value)
        else if (value === true) element.setAttribute(name, '')
        else if (value !== false && value != null) element.setAttribute(name, value)
    }
    element.append(...children.flat().filter((child): child is Node | string => child != null))
    return element
}
