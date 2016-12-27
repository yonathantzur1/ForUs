import { Component, Input } from '@angular/core';

@Component({
    selector: 'navbar',
    templateUrl: 'views/navbar.html'
})

export class NavbarComponent {
    @Input() name: string
}