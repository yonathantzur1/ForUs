import { Component, Input } from '@angular/core';

@Component({
    selector: 'userPasswordWindow',
    templateUrl: './userPasswordWindow.html',
    providers: []
})

export class UserPasswordWindowComponent {
    @Input() userId: string;

    constructor() { }

    CloseWindow() {

    }
}