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
            var time = msgData.time;
        });

        $("#chat-body-sector").bind("DOMNodeInserted", function () {
            self.ScrollToBottom();
        })
    }

    CloseChat = function () {
        this.chatData.isOpen = false;
    }

    SendMessage = function () {
        // Delete spaces from the start and the end of the message text.
        this.msghInput = this.msghInput.trim();

        if (this.msghInput) {
            var msgData = {
                "from": this.chatData.user._id,
                "to": this.chatData.friend._id,
                "text": this.msghInput,
                "time": new Date()
            };

            this.msghInput = "";

            this.messages.push(msgData);
            this.socket.emit("SendMessage", msgData, this.token);
        }
    }

    MsgInputKeyup = function (event: any) {
        if (event.code == "Enter") {
            this.SendMessage();
        }
    }

    ScrollToBottom = function () {
        $("#chat-body-sector")[0].scrollTop = $("#chat-body-sector")[0].scrollHeight;
    }

    GetTimeString = function (date: Date) {
        var localDate = new Date(date);

        var HH = localDate.getHours().toString();
        var mm = localDate.getMinutes().toString();

        if (HH.length == 1) {
            HH = "0" + HH;
        }

        if (mm.length == 1) {
            mm = "0" + mm;
        }

        return (HH + ":" + mm);
    }
}