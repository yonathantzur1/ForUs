import { Component, OnInit, Input } from '@angular/core';

import { FriendRequestsWindowService } from '../../services/friendRequestsWindow/friendRequestsWindow.service';


@Component({
    selector: 'friendRequestsWindow',
    templateUrl: './friendRequestsWindow.html',
    providers: [FriendRequestsWindowService]
})

export class FriendRequestsWindowComponent implements OnInit {
    defaultProfileImage: string = "./app/components/profilePicture/pictures/empty-profile.png";

    constructor(private friendRequestsWindowService: FriendRequestsWindowService) { }

    ngOnInit() {

    }
}