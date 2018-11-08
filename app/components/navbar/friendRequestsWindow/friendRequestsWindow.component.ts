import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { GlobalService } from '../../../services/global/global.service';
import { FriendRequestsWindowService } from '../../../services/navbar/friendRequestsWindow/friendRequestsWindow.service';
import { NavbarService } from '../../../services/navbar/navbar.service';

import { Router } from '@angular/router';

@Component({
    selector: 'friendRequestsWindow',
    templateUrl: './friendRequestsWindow.html',
    providers: [FriendRequestsWindowService]
})

export class FriendRequestsWindowComponent implements OnInit, OnChanges {
    @Input() isFriendRequestsWindowOpen: Array<string>;
    @Input() friendRequests: Array<string>;
    @Input() AddFriend: Function;
    @Input() IgnoreFriendRequest: Function;

    // IDs of friends that confirmed the friend request of the user.
    @Input() confirmedReuests: Array<string>;

    isFriendRequestsLoading: boolean;
    friendRequestsObjects: Array<any> = [];
    friendConfirmObjects: Array<any> = [];
    isFirstClosing: boolean = true;
    isFirstOpenning: boolean = true;
    isFriendRequestsLoaded: boolean = false;

    constructor(private router: Router,
        private navbarService: NavbarService,
        private friendRequestsWindowService: FriendRequestsWindowService,
        private globalService: GlobalService) { }

    ngOnInit() {
        var self = this;

        self.globalService.SocketOn('ClientUpdateFriendRequestsStatus', function (friendId: string) {
            self.RemoveFriendRequestById(friendId);
        });

        self.globalService.SocketOn('GetFriendRequest', function () {
            self.LoadFriendRequestsObjects();
        });

        self.globalService.SocketOn('DeleteFriendRequest', function (friendId: string) {
            self.RemoveFriendRequestById(friendId);
        });

        self.globalService.SocketOn('ClientRemoveFriendUser', function (friendId: string) {
            self.RemoveFriendRequestById(friendId);
            self.RemoveFriendConfirmById(friendId);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        // In case of loading data for the first time.
        if (changes.friendRequests &&
            !changes.friendRequests.firstChange &&
            !this.isFriendRequestsLoaded) {
            this.LoadFriendRequestsObjects();
        }

        // In case of confirm request added.
        if (changes.confirmedReuests &&
            !changes.confirmedReuests.firstChange &&
            changes.confirmedReuests.currentValue.length > 0) {
            this.LoadFriendRequestsObjects();
        }

        // On first Openning.
        if (changes.isFriendRequestsWindowOpen &&
            changes.isFriendRequestsWindowOpen.currentValue &&
            !changes.isFriendRequestsWindowOpen.firstChange &&
            this.isFirstOpenning) {
            this.isFirstOpenning = false;

            if (this.confirmedReuests.length > 0) {
                // Removing friend requests confirm alerts from DB.
                this.friendRequestsWindowService.RemoveRequestConfirmAlert(this.confirmedReuests).then((result: any) => { });
            }
        }

        // On first closing.
        if (changes.isFriendRequestsWindowOpen &&
            changes.isFriendRequestsWindowOpen.currentValue == false &&
            !changes.isFriendRequestsWindowOpen.firstChange &&
            this.isFirstClosing) {
            this.isFirstClosing = false;

            // Removing friend requests confirm alerts from client.
            this.friendConfirmObjects = [];
            this.confirmedReuests.splice(0);
        }
    }

    LoadFriendRequestsObjects() {
        if (this.friendRequests.length > 0 || this.confirmedReuests.length > 0) {
            this.isFriendRequestsLoading = true;
            this.navbarService.GetFriends(this.friendRequests.concat(this.confirmedReuests)).then((friendsResult: Array<any>) => {
                if (friendsResult) {
                    this.friendRequestsObjects = [];
                    this.friendConfirmObjects = [];

                    this.isFriendRequestsLoaded = true;

                    // Running on all friends and confirmed friends of the request.
                    friendsResult.forEach((friend: any) => {
                        // In case the friend object is for friend request.
                        if (this.friendRequests.indexOf(friend._id) != -1) {
                            this.friendRequestsObjects.push(friend);
                        }
                        // In case the friend object is for friend request confirm notification.
                        else if (this.confirmedReuests.indexOf(friend._id) != -1) {
                            this.friendConfirmObjects.push(friend);
                        }
                    });
                }

                this.isFriendRequestsLoading = false;
                this.isFriendRequestsLoaded = true;
            });
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

    FriendAccept(requestId: string) {
        this.isFriendRequestsLoading = true;
        this.RemoveFriendRequestById(requestId);
        var self = this;

        self.AddFriend(requestId, function (res: any) {
            self.isFriendRequestsLoading = false;
        });
    }

    FriendIgnore(requestId: string) {
        this.isFriendRequestsLoading = true;
        this.RemoveFriendRequestById(requestId);
        var self = this;

        self.IgnoreFriendRequest(requestId, function (res: any) {
            self.isFriendRequestsLoading = false;
        });
    }

    RemoveFriendRequestById(friendId: string) {
        this.friendRequestsObjects = this.friendRequestsObjects.filter((friendRequest: any) => {
            return (friendRequest._id != friendId);
        });
    }

    RemoveFriendConfirmById(friendId: string) {
        this.friendConfirmObjects = this.friendConfirmObjects.filter((friendConfirm: any) => {
            return (friendConfirm._id != friendId);
        });
    }

    OpenUserPage(friendId: string) {
        this.router.navigateByUrl("/profile/" + friendId);
        this.globalService.setData("hideSidenav", true);
    }
}