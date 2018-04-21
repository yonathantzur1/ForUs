import { Component, OnInit, Input } from '@angular/core';

import { ChatsWindowService } from '../../../services/navbar/chatsWindow/chatsWindow.service';
import { GlobalService } from '../../../services/global/global.service';

declare function GetDateDetailsString(localDate: Date, currDate: Date, isShortMonths: boolean): string;

@Component({
    selector: 'chatsWindow',
    templateUrl: './chatsWindow.html',
    providers: [ChatsWindowService]
})

export class ChatsWindowComponent implements OnInit {
    @Input() messagesNotifications: Object;
    @Input() OpenChat: Function;

    isLoading: boolean;
    chats: any = [];
    isChatsLoading: boolean;

    constructor(private chatsWindowService: ChatsWindowService, private globalService: GlobalService) { }

    ngOnInit() {
        this.isChatsLoading = true;
        this.LoadChatsObjects();

        this.globalService.SocketOn('ClientUpdateSendMessage', function (msgData: any) {
            var isChatUpdated = false;

            for (var i = 0; i < this.chats.length; i++) {
                var chat = this.chats[i];

                if (chat.friendId == msgData.to) {
                    chat.lastMessage.text = msgData.isImage ? "" : msgData.text;
                    chat.lastMessage.time = (new Date()).toISOString();
                    chat.lastMessage.isImage = msgData.isImage ? true : false;
                    isChatUpdated = true;

                    break;
                }
            }

            if (!isChatUpdated) {
                this.LoadChatsObjects();
            }
        }, this);

        this.globalService.SocketOn('ClientUpdateGetMessage', function (msgData: any) {
            var isChatUpdated = false;

            for (var i = 0; i < this.chats.length; i++) {
                var chat = this.chats[i];

                if (chat.friendId == msgData.from) {
                    chat.lastMessage.text = msgData.isImage ? "" : msgData.text;
                    chat.lastMessage.time = (new Date()).toISOString();
                    chat.lastMessage.isImage = msgData.isImage ? true : false;
                    isChatUpdated = true;

                    break;
                }
            }

            if (!isChatUpdated) {
                this.LoadChatsObjects();
            }
        }, this);

        this.globalService.SocketOn('ClientRemoveFriendUser', function (friendId: string) {
            this.RemoveFriendChat(friendId);
        }, this);
    }

    LoadChatsObjects() {
        this.chatsWindowService.GetAllChats().then((function (chats: any) {
            this.chats = chats;
            this.isChatsLoading = false;
        }).bind(this));
    }

    GetUnreadMessagesNumber() {
        var counter = 0;

        Object.keys(this.messagesNotifications).forEach((id: any) => {
            counter += this.messagesNotifications[id].unreadMessagesNumber;
        });

        return counter;
    }

    GetUnreadMessagesNumberText() {
        if (this.chats.length == 0) {
            return "אין הודעות חדשות";
        }
        else {
            var unreadMessagesNumber = this.GetUnreadMessagesNumber();

            if (unreadMessagesNumber == 0) {
                return "שיחות אחרונות";
            }
            else if (unreadMessagesNumber == 1) {
                return "הודעה 1 שלא נקראה";
            }
            else {
                return (unreadMessagesNumber + " הודעות שלא נקראו");
            }
        }
    }

    CalculateChatTimeString(chat: any) {
        var localDate = new Date(chat.lastMessage.time);
        var currDate = new Date();
        currDate.setHours(23, 59, 59, 999);

        var HH = localDate.getHours().toString();
        var mm = localDate.getMinutes().toString();

        if (mm.length == 1) {
            mm = "0" + mm;
        }

        var dateTimeString = "";

        var timeDiff = Math.abs(currDate.getTime() - localDate.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (diffDays <= 7) {
            dateTimeString = HH + ":" + mm;
        }

        chat.timeString = { "dateDetailsString": GetDateDetailsString(localDate, currDate, true), "dateTimeString": dateTimeString };
    }

    GetFriendName(friend: any) {
        if (!friend) {
            return null;
        }
        else {
            return (friend.firstName + " " + friend.lastName);
        }
    }

    GetFriendProfile(friend: any) {
        if (!friend) {
            return null;
        }
        else {
            return (friend.profileImage);
        }
    }

    SortByDate(chats: any) {
        chats = chats.sort((a: any, b: any) => {
            var firstDate = new Date(a.lastMessage.time);
            var secondDate = new Date(b.lastMessage.time);

            if (firstDate > secondDate) {
                return -1;
            }
            else if (firstDate < secondDate) {
                return 1;
            }
            else {
                return 0;
            }
        });

        return chats;
    }

    RemoveFriendChat(friendId: string) {
        for (var i = 0; i < this.chats.length; i++) {
            if (this.chats[i].friendId == friendId) {
                this.chats.splice(i, 1);
                break;
            }
        }
    }
}