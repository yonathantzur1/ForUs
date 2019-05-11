import { Component, OnInit, Input } from '@angular/core';

import { ChatService } from '../../../services/chat/chat.service';
import { GlobalService } from '../../../services/global/global.service';

@Component({
    selector: 'chatsWindow',
    templateUrl: './chatsWindow.html',
    providers: [ChatService],
    styleUrls: ['./chatsWindow.css']
})

export class ChatsWindowComponent implements OnInit {
    @Input() messagesNotifications: Object;
    @Input() OpenChat: Function;

    isLoading: boolean;
    chats: any = [];

    constructor(private chatService: ChatService,
        public globalService: GlobalService) { }

    ngOnInit() {
        this.LoadChatsObjects();

        var self = this;

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

        // Remove friend from management screen.
        self.globalService.SocketOn('ClientRemoveFriendUser', function (friendId: string) {
            self.RemoveFriendChat(friendId);
        });

        // Remove friend by the user from user page.
        self.globalService.SocketOn('ClientRemoveFriend', function (friendId: string) {
            self.RemoveFriendChat(friendId);
        });
    }

    LoadChatsObjects() {
        this.isLoading = true;

        this.chatService.GetAllPreviewChats().then((function (chats: any) {
            this.isLoading = false;
            this.chats = chats;
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

        chat.timeString = {
            "dateDetailsString": this.globalService.globalObject.GetDateDetailsString(localDate, currDate, true),
            "dateTimeString": dateTimeString
        };
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
            if (this.chats[i].friend._id == friendId) {
                this.chats.splice(i, 1);
                break;
            }
        }
    }
}