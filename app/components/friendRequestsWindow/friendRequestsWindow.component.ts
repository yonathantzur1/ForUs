import { Component, OnInit, Input } from '@angular/core';

import { FriendRequestsWindowService } from '../../services/friendRequestsWindow/friendRequestsWindow.service';


@Component({
    selector: 'friendRequestsWindow',
    templateUrl: './friendRequestsWindow.html',
    providers: [FriendRequestsWindowService]
})

export class FriendRequestsWindowComponent implements OnInit {
    @Input() friendRequests: Array<string>;
    defaultProfileImage: string = "./app/components/profilePicture/pictures/empty-profile.png";

    constructor(private friendRequestsWindowService: FriendRequestsWindowService) { }

    ngOnInit() {

    }

    GetFriendRequestsNumberText = function () {
        var friendRequestsNumber = this.friendRequests.length;

        if (friendRequestsNumber == 0) {
            return "אין בקשות חברות חדשות";
        }
        else if (friendRequestsNumber == 1) {
            return "בקשת חברות 1 חדשה";
        }
        else {
            return (friendRequestsNumber + " בקשות חברות חדשות");
        }
    }
}