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
 
    friendRequestsObjects: Array<any> = [];
    isFirstFriendRequestsObjectsLoaded: boolean = false;
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
            !changes.friendRequests.firstChange &&
            !this.isFirstFriendRequestsObjectsLoaded) {
            this.isFirstFriendRequestsObjectsLoaded = true;
            this.isFriendRequestsLoading = true;
            this.LoadFriendRequestsObjects();
        }
    }

    LoadFriendRequestsObjects() {
        if (this.friendRequests.length > 0) {
            this.navbarService.GetFriends(this.friendRequests).then((friendsResult: Array<any>) => {
                this.friendRequestsObjects = friendsResult;
                this.isFriendRequestsLoading = false;
            });
        }
        else {
            this.friendRequestsObjects = [];
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