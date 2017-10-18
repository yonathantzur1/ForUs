import { Component, OnInit, Input } from '@angular/core';

import { UnreadWindowService } from '../../services/unreadWindow/unreadWindow.service';
import { GlobalService } from '../../services/global/global.service';


@Component({
    selector: 'unreadWindow',
    templateUrl: './unreadWindow.html',
    providers: [UnreadWindowService]
})

export class UnreadWindowComponent implements OnInit {
    @Input() friends: Array<any>;
    @Input() messagesNotifications: Object;
    @Input() OpenChat: Function;

    socket: any;
    days: Array<string> = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    months: Array<string> = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
        "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    chats: any = [];
    defaultProfileImage: string = "./app/components/profilePicture/pictures/empty-profile.png";
    isChatsLoading: boolean;
    isRefreshActive: boolean = false;

    constructor(private unreadWindowService: UnreadWindowService, private globalService: GlobalService) {
        this.socket = globalService.socket;
    }

    ngOnInit() {
        var self = this;
        this.isChatsLoading = true;

        this.LoadChatsObjects();

        self.socket.on('ClientUpdateSendMessage', function (msgData: any) {
            var isChatUpdated = false;

            for (var i = 0; i < self.chats.length; i++) {
                var chat = self.chats[i];

                if (chat.friendId == msgData.to) {
                    chat.lastMessage.text = msgData.text;
                    chat.lastMessage.time = (new Date()).toISOString();
                    isChatUpdated = true;

                    break;
                }
            }

            if (!isChatUpdated) {
                self.LoadChatsObjects();
            }
        });

        self.socket.on('ClientUpdateGetMessage', function (msgData: any) {
            var isChatUpdated = false;

            for (var i = 0; i < self.chats.length; i++) {
                var chat = self.chats[i];

                if (chat.friendId == msgData.from) {
                    chat.lastMessage.text = msgData.text;
                    chat.lastMessage.time = (new Date()).toISOString();
                    isChatUpdated = true;

                    break;
                }
            }

            if (!isChatUpdated) {
                self.LoadChatsObjects();
            }
        });
    }

    LoadChatsObjects = function () {
        var self = this;

        self.unreadWindowService.GetAllChats().then(function (chats: any) {
            self.chats = chats;
            self.isChatsLoading = false;
            self.isRefreshActive = false;
        });
    }

    GetUnreadMessagesNumber = function () {
        var counter = 0;

        Object.keys(this.messagesNotifications).forEach((id: any) => {
            counter += this.messagesNotifications[id].unreadMessagesNumber;
        });

        return counter;
    }

    GetUnreadMessagesNumberText = function () {
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
        var datesDaysDiff = Math.abs(currDate.getDate() - localDate.getDate());
        var dateDetailsString = "";

        if (diffDays <= 7) {
            if (diffDays <= 2) {
                if (currDate.getDate() == localDate.getDate()) {
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
                dateDetailsString = (localDate.getDate()) + " ב" + this.months[localDate.getMonth()]
            }
            else {
                dateDetailsString = (localDate.getDate()) + "." + (localDate.getMonth() + 1) + "." + localDate.getFullYear();
            }
        }

        chat.timeString = { "dateDetailsString": dateDetailsString, "dateTimeString": dateTimeString };
    }

    GetFriend = function (friendId: string) {
        return (this.friends.find(function (friend: any) {
            return (friend._id == friendId);
        }));
    }

    GetFriendName = function (friendId: string) {
        var friendObj = this.GetFriend(friendId);

        return friendObj ? (friendObj.firstName + " " + friendObj.lastName) : "";
    }

    GetFriendProfile = function (friendId: string) {
        var friendObj = this.GetFriend(friendId);

        return friendObj ? friendObj.profileImage : null;
    }
}