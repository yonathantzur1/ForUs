import { Component, Input } from '@angular/core';

import { GlobalService } from '../../services/global/global.service';
import { ChatService } from '../../services/chat/chat.service';

@Component({
    selector: 'chat',
    templateUrl: './chat.html',
    providers: [ChatService]
})

export class ChatComponent {
    @Input() chatData: any;

    constructor(private globalService: GlobalService, private chatService: ChatService) {
        this.globalService.data.subscribe(value => {

        });
    }

    CloseChat = function () {
        this.chatData.isOpen = false;
    }
}