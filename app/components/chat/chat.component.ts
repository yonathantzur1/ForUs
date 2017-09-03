import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { ChatService } from '../../services/chat/chat.service';
import { GlobalService } from '../../services/global/global.service';

declare var getToken: any;

@Component({
    selector: 'chat',
    templateUrl: './chat.html',
    providers: [ChatService]
})

export class ChatComponent implements OnInit, OnDestroy {
    @Input() chatData: any;
    socket: any;
    messages: Array<any> = [];
    token: any = getToken();
    isMessagesLoading: boolean;

    constructor(private chatService: ChatService, private globalService: GlobalService) {
        this.globalService.data.subscribe(value => {
            if (value["chatData"]) {
                this.messages = [];
                this.chatData = value["chatData"];
                this.InitializeChat();
            }
        });
    }

    ngOnInit() {
        var self = this;

        self.socket = self.chatData.socket;
        self.socket.on('GetMessage', function (msgData: any) {
            if (msgData.from == self.chatData.friend._id) {
                msgData.time = new Date();
                self.messages.push(msgData);
            }            
        });
        
        $("#chat-body-sector").bind("DOMNodeInserted", this.ScrollToBottom);
    }

    ngOnDestroy() {
        $("#chat-body-sector").unbind("DOMNodeInserted", this.ScrollToBottom);
        this.globalService.deleteData("chatData");
    }

    InitializeChat = function () {
        var self = this;

        self.isMessagesLoading = true;
        self.chatService.GetChat([self.chatData.user._id, self.chatData.friend._id], getToken()).then((chat: any) => {
            if (chat) {
                self.messages = chat.messages;
            }

            self.isMessagesLoading = false;
        });
    }

    CloseChat = function () {
        this.chatData.isOpen = false;
    }

    SendMessage = function () {
        if (!this.isMessagesLoading) {
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