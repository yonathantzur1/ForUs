import { Component, OnInit, Input } from '@angular/core';

import { GlobalService } from '../../services/global/global.service';
import { ChatService } from '../../services/chat/chat.service';

@Component({
    selector: 'chat',
    templateUrl: './chat.html',
    providers: [ChatService]
})

export class ChatComponent implements OnInit {
    @Input() chatData: any;
    socket: any;
    messages: Array<any> = [];

    constructor(private globalService: GlobalService, private chatService: ChatService) {
        this.globalService.data.subscribe(value => {

        });
    }

    ngOnInit() {
        this.socket = this.chatData.socket
    }

    CloseChat = function () {
        this.chatData.isOpen = false;
    }

    SendMessage = function () {
        var msgData = {
            "from": this.chatData.user._id,
            "to": this.chatData.friend._id,
            "text": this.msghInput
        };

        this.msghInput = "";

        this.messages.push(msgData);
    }

    MsgInputKeyup = function (event: any) {
        if (event.code == "Enter") {
            this.SendMessage();
        }
    }
}