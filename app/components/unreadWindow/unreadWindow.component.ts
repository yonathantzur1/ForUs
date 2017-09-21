import { Component, Input } from '@angular/core';


@Component({
    selector: 'unreadWindow',
    templateUrl: './unreadWindow.html',
    providers: []
})

export class UnreadWindowComponent {
    @Input() messagesNotifications: any;

    constructor() { }

}