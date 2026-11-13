import { h } from '../../../utils/dom'

// Floating button (the FloatingButton component of the other fronts)
export const floatingButton = ({ label, active = false, ariaLabel, onClick }: { label: string, active?: boolean, ariaLabel: string, onClick: () => void }) =>
    h('button', { type: 'button', class: `floating-btn${active ? ' active' : ''}`, 'aria-label': ariaLabel, onclick: onClick }, label)
