import { h } from '../../../utils/dom.js'

// Floating button (the FloatingButton component of the other fronts)
export const floatingButton = ({ label, active = false, ariaLabel, onClick }) =>
    h('button', { type: 'button', class: `floating-btn${active ? ' active' : ''}`, 'aria-label': ariaLabel, onclick: onClick }, label)
