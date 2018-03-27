import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { GlobalService } from '../../services/global/global.service';
import { FriendRequestsWindowService } from '../../services/friendRequestsWindow/friendRequestsWindow.service';
import { NavbarService } from '../../services/navbar/navbar.service';

@Component({
    selector: 'friendRequestsWindow',
    templateUrl: './friendRequestsWindow.html',
    providers: [FriendRequestsWindowService]
})

export class FriendRequestsWindowComponent implements OnInit, OnChanges {
    @Input() friendRequests: Array<string>;
    @Input() AddFriend: Function;
    @Input() IgnoreFriendRequest: Function;

    // IDs of friends that confirmed the friend request of the user.
    @Input() confirmedReuests: Array<string>;

    friendRequestsObjects: Array<any> = [];
    friendConfirmObjects: Array<any> = [];
    isRequestsObjectsLoaded: boolean = false;
    isFriendRequestsLoading: boolean = false;

    constructor(private navbarService: NavbarService,
        private friendRequestsWindowService: FriendRequestsWindowService,
        private globalService: GlobalService) {
    }

    ngOnInit() {
        var self = this;

        self.globalService.SocketOn('ClientUpdateFriendRequestsStatus', function (friendId: string) {
            self.friendRequestsObjects = self.friendRequestsObjects.filter((request: any) => {
                return (request._id != friendId);
            });
        });

        self.globalService.SocketOn('GetFriendRequest', function () {
            self.LoadFriendRequestsObjects();
        });

        self.globalService.SocketOn('DeleteFriendRequest', function (friendId: string) {
            self.friendRequestsObjects = self.friendRequestsObjects.filter((request: any) => {
                return (request._id != friendId);
            });
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        // In case of loading data for the first time.
        if (changes.friendRequests &&
            changes.confirmedReuests &&
            !changes.friendRequests.firstChange &&
            !changes.confirmedReuests.firstChange &&
            !this.isRequestsObjectsLoaded) {
            this.isRequestsObjectsLoaded = true;
            this.isFriendRequestsLoading = true;
            this.LoadFriendRequestsObjects();
        }
    }

    LoadFriendRequestsObjects() {
        if (this.friendRequests.length > 0 || this.confirmedReuests.length > 0) {
            this.navbarService.GetFriends(this.friendRequests.concat(this.confirmedReuests)).then((friendsResult: Array<any>) => {
                if (friendsResult) {
                    // Running on all friends and confirmed friends of the request.
                    friendsResult.forEach((friend: any) => {
                        if (this.friendRequests.indexOf(friend._id) != -1) {
                            this.friendRequestsObjects.push(friend);
                        }
                        else if (this.confirmedReuests.indexOf(friend._id) != -1) {
                            this.friendConfirmObjects.push(friend);
                        }
                    });
                }

                this.isFriendRequestsLoading = false;
            });
        }
        else {            
            this.isFriendRequestsLoading = false;
        }
    }

    GetFriendRequestsNumberText() {
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

    FriendRequestBtnClicked(friendId: string) {
        this.globalService.socket.emit("ServerUpdateFriendRequestsStatus", friendId);
    }
}