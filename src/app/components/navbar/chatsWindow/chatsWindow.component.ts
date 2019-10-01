import { Component, OnInit, Input } from '@angular/core';

import { ChatService } from '../../../services/chat.service';
import { ImageService } from 'src/app/services/global/image.service';
import { SocketService } from '../../../services/global/socket.service';

import { DateService } from '../../../services/global/date.service';

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
        public imageService: ImageService,
        private socketService: SocketService,
        private dateService: DateService) { }

    ngOnInit() {
        this.LoadChatsObjects();

        let self = this;

        self.socketService.SocketOn('ClientUpdateSendMessage', function (msgData: any) {
            let isChatUpdated = false;

            for (let i = 0; i < self.chats.length; i++) {
                let chat = self.chats[i];

                if (chat.friendId == msgData.to) {
                    chat.lastMessage.text = msgData.isImage ? '' : msgData.text;
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

        self.socketService.SocketOn('ClientUpdateGetMessage', function (msgData: any) {
            let isChatUpdated = false;

            for (let i = 0; i < self.chats.length; i++) {
                let chat = self.chats[i];

                if (chat.friendId == msgData.from) {
                    chat.lastMessage.text = msgData.isImage ? '' : msgData.text;
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
        self.socketService.SocketOn('ClientRemoveFriendUser', function (friendId: string) {
            self.RemoveFriendChat(friendId);
        });

        // Remove friend by the user from user page.
        self.socketService.SocketOn('ClientRemoveFriend', function (friendId: string) {
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
        let counter = 0;

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
            let unreadMessagesNumber = this.GetUnreadMessagesNumber();

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
        let localDate = new Date(chat.lastMessage.time);
        let currDate = new Date();
        currDate.setHours(23, 59, 59, 999);

        let HH = localDate.getHours().toString();
        let mm = localDate.getMinutes().toString();

        if (mm.length == 1) {
            mm = "0" + mm;
        }

        let dateTimeString = '';

        let timeDiff = Math.abs(currDate.getTime() - localDate.getTime());
        let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (diffDays <= 7) {
            dateTimeString = HH + ":" + mm;
        }

        chat.timeString = {
            "dateDetailsString": this.dateService.GetDateDetailsString(localDate, currDate, true),
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
            let firstDate = new Date(a.lastMessage.time);
            let secondDate = new Date(b.lastMessage.time);

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
        for (let i = 0; i < this.chats.length; i++) {
            if (this.chats[i].friend._id == friendId) {
                this.chats.splice(i, 1);
                break;
            }
        }
    }
}