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
    @Input() isFriendsLoading: boolean;
    @Input() friends: Array<any>;
    @Input() messagesNotifications: Object;
    @Input() OpenChat: Function;

    chats: any = [];
    isChatsLoading: boolean;

    constructor(private chatsWindowService: ChatsWindowService, private globalService: GlobalService) { }

    ngOnInit() {
        var self = this;
        this.isChatsLoading = true;

        this.LoadChatsObjects();

        self.globalService.SocketOn('ClientUpdateSendMessage', function (msgData: any) {
            var isChatUpdated = false;

            for (var i = 0; i < self.chats.length; i++) {
                var chat = self.chats[i];

                if (chat.friendId == msgData.to) {
                    chat.lastMessage.text = msgData.isImage ? "" : msgData.text;
                    chat.lastMessage.time = (new Date()).toISOString();
                    chat.lastMessage.isImage = msgData.isImage ? true : false;
                    isChatUpdated = true;

                    break;
                }
            }

            if (!isChatUpdated) {
                self.LoadChatsObjects();
            }
        });

        self.globalService.SocketOn('ClientUpdateGetMessage', function (msgData: any) {
            var isChatUpdated = false;

            for (var i = 0; i < self.chats.length; i++) {
                var chat = self.chats[i];

                if (chat.friendId == msgData.from) {
                    chat.lastMessage.text = msgData.isImage ? "" : msgData.text;
                    chat.lastMessage.time = (new Date()).toISOString();
                    chat.lastMessage.isImage = msgData.isImage ? true : false;
                    isChatUpdated = true;

                    break;
                }
            }

            if (!isChatUpdated) {
                self.LoadChatsObjects();
            }
        });

        self.globalService.SocketOn('ClientRemoveFriendUser', function (friendId: string) {
            self.RemoveFriendChat(friendId);
        });
    }

    LoadChatsObjects() {
        var self = this;

        self.chatsWindowService.GetAllChats().then(function (chats: any) {
            self.chats = chats;
            self.isChatsLoading = false;
        });
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

    GetFriend(friendId: string) {
        return (this.friends.find(function (friend: any) {
            return (friend._id == friendId);
        }));
    }

    GetFriendName(friendId: string) {
        var friendObj = this.GetFriend(friendId);

        return friendObj ? (friendObj.firstName + " " + friendObj.lastName) : "";
    }

    GetFriendProfile(friendId: string) {
        var friendObj = this.GetFriend(friendId);

        return friendObj ? friendObj.profileImage : null;
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