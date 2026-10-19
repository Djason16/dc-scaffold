import { Component } from '@angular/core'

// Floating button: <button appFloatingButton (click)="...">, aria-label and class are passed through
@Component({
    selector: 'button[appFloatingButton]',
    host: { type: 'button', class: 'floating-btn' },
    template: `<ng-content />`,
})
export class FloatingButton {}
