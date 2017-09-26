import { Component, OnInit, Input } from '@angular/core';

import { UnreadWindowService } from '../../services/unreadWindow/unreadWindow.service';


@Component({
    selector: 'unreadWindow',
    templateUrl: './unreadWindow.html',
    providers: [UnreadWindowService]
})

export class UnreadWindowComponent implements OnInit {
    @Input() messagesNotifications: any;

    constructor(private unreadWindowService: UnreadWindowService) { }

    ngOnInit() {
        this.unreadWindowService.GetAllChats().then(function (chats) {
            var x = chats;
        });
    }

    GetUnreadMessagesNumber = function () {
        var counter = 0;

        Object.keys(this.messagesNotifications).forEach((id: any) => {
            counter += this.messagesNotifications[id].unreadMessagesNumber;
        });

        return counter;
    }
}