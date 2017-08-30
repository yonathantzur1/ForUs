import { Component, OnInit, Input } from '@angular/core';

import { GlobalService } from '../../services/global/global.service';
import { ChatService } from '../../services/chat/chat.service';

declare var getToken: any;

@Component({
    selector: 'chat',
    templateUrl: './chat.html',
    providers: [ChatService]
})

export class ChatComponent implements OnInit {
    @Input() chatData: any;
    socket: any;
    messages: Array<any> = [];
    token: any = getToken();

    constructor(private globalService: GlobalService, private chatService: ChatService) {
        this.globalService.data.subscribe(value => {

        });
    }

    ngOnInit() {
        var self = this;

        this.socket = this.chatData.socket
        this.socket.on('GetMessage', function (msgData: any) {
            self.messages.push(msgData);
        });
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
        this.socket.emit("SendMessage", msgData, this.token);
    }

    MsgInputKeyup = function (event: any) {
        if (event.code == "Enter") {
            this.SendMessage();
        }
    }
}