import { Component, OnInit, Input, AfterViewChecked } from '@angular/core';

import { ChatService } from '../../services/chat/chat.service';
import { GlobalService } from '../../services/global/global.service';

declare var getToken: any;

@Component({
    selector: 'chat',
    templateUrl: './chat.html',
    providers: [ChatService]
})

export class ChatComponent implements OnInit, AfterViewChecked {
    @Input() chatData: any;
    socket: any;
    messages: Array<any> = [];
    token: any = getToken();
    isMessagesLoading: boolean;
    chatBodyScrollHeight: number = 0;

    days: Array<string> = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    months: Array<string> = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
        "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

    // Unread messages line sector properties //
    isAllowShowUnreadLine: boolean;
    unreadMessagesNumber: number;

    constructor(private chatService: ChatService, private globalService: GlobalService) {
        this.socket = globalService.socket;

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

        self.socket.on('GetMessage', function (msgData: any) {
            if (msgData.from == self.chatData.friend._id) {
                msgData.time = new Date();
                self.messages.push(msgData);
            }
        });
    }

    ngAfterViewChecked() {
        if ($("#chat-body-sector")[0].scrollHeight != this.chatBodyScrollHeight) {
            this.ScrollToBottom();
            this.chatBodyScrollHeight = $("#chat-body-sector")[0].scrollHeight;
        }
    }

    InitializeChat = function () {
        var self = this;

        self.isAllowShowUnreadLine = true;
        self.chatBodyScrollHeight = 0;
        self.isMessagesLoading = true;
        self.chatService.GetChat([self.chatData.user._id, self.chatData.friend._id], getToken()).then((chat: any) => {
            if (chat) {
                self.messages = chat.messages;
            }

            self.isMessagesLoading = false;
            $("#msg-input").focus();
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
                this.isAllowShowUnreadLine = false;

                this.messages.push(msgData);
                this.socket.emit("SendMessage", msgData, this.token);
            }
        }
    }

    MsgInputKeyup = function (event: any) {
        // In case of pressing ENTER.
        if (event.keyCode == 13) {
            this.SendMessage();
        }
        // In case of pressing ESCAPE.
        else if (event.keyCode == 27) {
            this.CloseChat();
        }
        else {
            this.socket.emit("ServerFriendTyping", this.chatData.friend._id, this.token);
        }
    }

    ScrollToBottom = function () {
        $("#chat-body-sector")[0].scrollTop = $("#chat-body-sector")[0].scrollHeight;
    }

    GetTimeString = function (date: Date) {
        var localDate = new Date(date);

        var HH = localDate.getHours().toString();
        var mm = localDate.getMinutes().toString();

        if (mm.length == 1) {
            mm = "0" + mm;
        }

        return (HH + ":" + mm);
    }

    IsShowUnreadLine = function (msgFromId: string, msgId: string) {
        var friendMessagesNotifications = this.chatData.messagesNotifications[msgFromId];

        if (this.isAllowShowUnreadLine &&
            friendMessagesNotifications &&
            msgId == friendMessagesNotifications.firstUnreadMessageId) {
            this.unreadMessagesNumber = friendMessagesNotifications.unreadMessagesNumber;

            return true;
        }
        else {
            return false;
        }
    }

    GetUnreadMessagesNumberText = function (unreadMessagesNumber: number) {
        if (unreadMessagesNumber == 1) {
            return ("הודעה 1 שלא נקראה");
        }
        else {
            return (unreadMessagesNumber + " הודעות שלא נקראו");
        }
    }

    IsShowDateBubble = function (index: number) {
        if (index == 0) {
            return true
        }
        else if (index > 0) {
            var currMessageDate = new Date(this.messages[index].time);
            var beforeMessageDate = new Date(this.messages[index - 1].time);

            if (currMessageDate.getDay() != beforeMessageDate.getDay() ||
                currMessageDate.getMonth() != beforeMessageDate.getMonth() ||
                currMessageDate.getFullYear() != beforeMessageDate.getFullYear()) {
                return true;
            }
        }

        return false;
    }

    GetDateBubbleText = function (index: number) {
        var localDate = new Date(this.messages[index].time);
        var currDate = new Date();

        var timeDiff = Math.abs(currDate.getTime() - localDate.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        var datesDaysDiff = Math.abs(currDate.getDay() - localDate.getDay());

        var dateDetailsString = "";

        if (diffDays <= 7) {
            if (diffDays <= 2) {
                if (currDate.getDay() == localDate.getDay()) {
                    dateDetailsString = "היום";
                }
                else if (Math.min((7 - datesDaysDiff), datesDaysDiff) <= 1) {
                    dateDetailsString = "אתמול";
                }
                else {
                    dateDetailsString = this.days[localDate.getDay()];
                }
            }
            else {
                dateDetailsString = this.days[localDate.getDay()];
            }
        }
        else {
            if (localDate.getFullYear() == currDate.getFullYear()) {
                dateDetailsString = (localDate.getDay() + 1) + " ב" + this.months[localDate.getMonth()]
            }
            else {
                dateDetailsString = (localDate.getDay() + 1) + "." + (localDate.getMonth() + 1) + "." + localDate.getFullYear();
            }
        }


        return dateDetailsString;
    }


    CalculateChatTimeString = function (chat: any) {
        var localDate = new Date(chat.lastMessage.time);
        var currDate = new Date();

        var HH = localDate.getHours().toString();
        var mm = localDate.getMinutes().toString();

        if (mm.length == 1) {
            mm = "0" + mm;
        }

        var dateTimeString = "";

        var timeDiff = Math.abs(currDate.getTime() - localDate.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        var datesDaysDiff = Math.abs(currDate.getDay() - localDate.getDay());
        var dateDetailsString = "";

        if (diffDays <= 7) {
            if (diffDays <= 2) {
                if (currDate.getDay() == localDate.getDay()) {
                    dateDetailsString = "היום";
                }
                else if (Math.min((7 - datesDaysDiff), datesDaysDiff) <= 1) {
                    dateDetailsString = "אתמול";
                }
                else {
                    dateDetailsString = this.days[localDate.getDay()];
                }
            }
            else {
                dateDetailsString = this.days[localDate.getDay()];
            }

            dateTimeString = HH + ":" + mm;
        }
        else {
            if (localDate.getFullYear() == currDate.getFullYear()) {
                dateDetailsString = (localDate.getDay() + 1) + " ב" + this.months[localDate.getMonth()]
            }
            else {
                dateDetailsString = (localDate.getDay() + 1) + "." + (localDate.getMonth() + 1) + "." + localDate.getFullYear();
            }
        }

        chat.timeString = { "dateDetailsString": dateDetailsString, "dateTimeString": dateTimeString };
    }

}