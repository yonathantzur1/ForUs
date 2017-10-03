import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import { UnreadWindowService } from '../../services/unreadWindow/unreadWindow.service';


@Component({
    selector: 'unreadWindow',
    templateUrl: './unreadWindow.html',
    providers: [UnreadWindowService]
})

export class UnreadWindowComponent implements OnInit, OnChanges {
    @Input() friends: Array<any>;
    @Input() messagesNotifications: Object;
    @Input() OpenChat: Function;
    @Input() isOpen: boolean;

    chats: any = [];
    defaultProfileImage: string = "./app/components/profilePicture/pictures/empty-profile.png";
    isChatsLoading: boolean;

    constructor(private unreadWindowService: UnreadWindowService) { }

    ngOnInit() {
        var self = this;
        this.isChatsLoading = true;

        self.unreadWindowService.GetAllChats().then(function (chats) {
            self.chats = chats;
            self.isChatsLoading = false;
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.messagesNotifications && !changes.messagesNotifications.firstChange) {
            var self = this;

            // Loading all chats.
            self.unreadWindowService.GetAllChats().then(function (chats) {
                self.chats = chats;
            });
        }
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