import { Component, OnInit, Input } from '@angular/core';

import { UnreadWindowService } from '../../services/unreadWindow/unreadWindow.service';


@Component({
    selector: 'unreadWindow',
    templateUrl: './unreadWindow.html',
    providers: [UnreadWindowService]
})

export class UnreadWindowComponent implements OnInit {
    @Input() friends: Array<any>;
    @Input() messagesNotifications: Object;
    @Input() OpenChat: Function;
    chats: any = [];
    defaultProfileImage: string = "./app/components/profilePicture/pictures/empty-profile.png";

    constructor(private unreadWindowService: UnreadWindowService) { }

    ngOnInit() {
        var self = this;

        self.unreadWindowService.GetAllChats().then(function (chats) {
            self.chats = chats;
        });
    }

    GetUnreadMessagesNumber = function () {
        var counter = 0;

        Object.keys(this.messagesNotifications).forEach((id: any) => {
            counter += this.messagesNotifications[id].unreadMessagesNumber;
        });

        return counter;
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
        var friendObj = (this.friends.find(function (friend: any) {
            return (friend._id == friendId);
        }));

        return (friendObj.firstName + " " + friendObj.lastName);
    }
}