import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { GlobalService } from '../../services/global/global.service';
import { FriendRequestsWindowService } from '../../services/friendRequestsWindow/friendRequestsWindow.service';
import { NavbarService } from '../../services/navbar/navbar.service';

declare var getToken: any;

@Component({
    selector: 'friendRequestsWindow',
    templateUrl: './friendRequestsWindow.html',
    providers: [FriendRequestsWindowService]
})

export class FriendRequestsWindowComponent implements OnInit, OnChanges {
    @Input() friendRequests: Array<string>;
    @Input() AddFriend: Function;
    @Input() IgnoreFriendRequest: Function;

    defaultProfileImage: string = "./app/components/profilePicture/pictures/empty-profile.png";
    friendRequestsObjects: Array<any> = [];
    isFirstFriendRequestsObjectsLoaded: boolean = false;
    isFriendRequestsLoading: boolean = false;;
    socket: any;

    constructor(private navbarService: NavbarService,
        private friendRequestsWindowService: FriendRequestsWindowService,
        private globalService: GlobalService) {
        this.socket = globalService.socket;
    }

    ngOnInit() {
        var self = this;

        self.socket.on('ClientUpdateFriendRequestsStatus', function (friendId: string) {
            self.friendRequestsObjects = self.friendRequestsObjects.filter((request: any) => {
                request._id != friendId;
            });
        });

        self.socket.on('GetFriendRequest', function () {
            self.LoadFriendRequestsObjects();
        });

        self.socket.on('DeleteFriendRequest', function (friendId: string) {
            self.friendRequestsObjects = self.friendRequestsObjects.filter((request: any) => {
                request._id != friendId;
            });
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.friendRequests &&
            !changes.friendRequests.firstChange &&
            !this.isFirstFriendRequestsObjectsLoaded) {
            this.isFirstFriendRequestsObjectsLoaded = true;
            this.LoadFriendRequestsObjects();
        }
    }

    LoadFriendRequestsObjects = function () {
        if (this.friendRequests.length > 0) {
            this.isFriendRequestsLoading = true;

            this.navbarService.GetFriends(this.friendRequests).then((friendsResult: Array<any>) => {
                this.friendRequestsObjects = friendsResult;
                this.isFriendRequestsLoading = false;
            });
        }
        else {
            this.friendRequestsObjects = [];
        }
    }

    GetFriendRequestsNumberText = function () {
        var friendRequestsNumber = this.friendRequests.length;

        if (friendRequestsNumber == 0) {
            return "אין בקשות חברות חדשות";
        }
        else if (friendRequestsNumber == 1) {
            return "בקשת חברות חדשה";
        }
        else {
            return (friendRequestsNumber + " בקשות חברות חדשות");
        }
    }

    FriendRequestBtnClicked = function (friendId: string) {
        this.socket.emit("ServerUpdateFriendRequestsStatus", getToken(), friendId);
    }
}