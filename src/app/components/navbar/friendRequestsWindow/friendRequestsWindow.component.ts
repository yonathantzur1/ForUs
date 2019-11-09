import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { ImageService } from 'src/app/services/global/image.service';
import { SocketService } from '../../../services/global/socket.service';
import { EventService, EVENT_TYPE } from '../../../services/global/event.service';
import { NavbarService } from '../../../services/navbar.service';

import { Router } from '@angular/router';

@Component({
    selector: 'friendRequestsWindow',
    templateUrl: './friendRequestsWindow.html',
    providers: [NavbarService],
    styleUrls: ['./friendRequestsWindow.css']
})

export class FriendRequestsWindowComponent implements OnInit, OnChanges {
    @Input() isFriendRequestsWindowOpen: Array<string>;
    @Input() friendRequests: Array<string>;
    @Input() addFriend: Function;
    @Input() ignoreFriendRequest: Function;

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
        public imageService: ImageService,
        private socketService: SocketService,
        private eventService: EventService) { }

    ngOnInit() {
        let self = this;

        self.socketService.socketOn('ClientUpdateFriendRequestsStatus', function (friendId: string) {
            self.removeFriendRequestById(friendId);
        });

        self.socketService.socketOn('GetFriendRequest', function () {
            self.loadFriendRequestsObjects();
        });

        self.socketService.socketOn('DeleteFriendRequest', function (friendId: string) {
            self.removeFriendRequestById(friendId);
        });

        self.socketService.socketOn('ClientRemoveFriendUser', function (friendId: string) {
            self.removeFriendRequestById(friendId);
            self.removeFriendConfirmById(friendId);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        // In case of loading data for the first time.
        if (changes.friendRequests &&
            !changes.friendRequests.firstChange &&
            !this.isFriendRequestsLoaded) {
            this.loadFriendRequestsObjects();
        }

        // In case of confirm request added.
        if (changes.confirmedReuests &&
            !changes.confirmedReuests.firstChange &&
            changes.confirmedReuests.currentValue.length > 0) {
            this.loadFriendRequestsObjects();
        }

        // On first Openning.
        if (changes.isFriendRequestsWindowOpen &&
            changes.isFriendRequestsWindowOpen.currentValue &&
            !changes.isFriendRequestsWindowOpen.firstChange &&
            this.isFirstOpenning) {
            this.isFirstOpenning = false;

            if (this.confirmedReuests.length > 0) {
                // Removing friend requests confirm alerts from DB.
                this.navbarService.removeFriendRequestConfirmAlert(this.confirmedReuests);
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

    loadFriendRequestsObjects() {
        if (this.friendRequests.length > 0 || this.confirmedReuests.length > 0) {
            this.isFriendRequestsLoading = true;
            this.navbarService.getFriends(this.friendRequests.concat(this.confirmedReuests)).then((friendsResult: Array<any>) => {
                if (friendsResult) {
                    this.friendRequestsObjects = [];
                    this.friendConfirmObjects = [];

                    this.isFriendRequestsLoaded = true;

                    // Running on all friends and confirmed friends of the request.
                    friendsResult.forEach((friend: any) => {
                        // In case the friend object is for friend request.
                        if (this.friendRequests.includes(friend._id)) {
                            this.friendRequestsObjects.push(friend);
                        }
                        // In case the friend object is for friend request confirm notification.
                        else if (this.confirmedReuests.includes(friend._id)) {
                            this.friendConfirmObjects.push(friend);
                        }
                    });
                }

                this.isFriendRequestsLoading = false;
                this.isFriendRequestsLoaded = true;
            });
        }
    }

    getFriendRequestsNumberText() {
        let friendRequestsNumber = this.friendRequests.length;

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

    friendAccept(requestId: string) {
        this.isFriendRequestsLoading = true;
        this.removeFriendRequestById(requestId);
        let self = this;

        self.addFriend(requestId, function (res: any) {
            self.isFriendRequestsLoading = false;
        });
    }

    friendIgnore(requestId: string) {
        this.isFriendRequestsLoading = true;
        this.removeFriendRequestById(requestId);
        let self = this;

        self.ignoreFriendRequest(requestId, function (res: any) {
            self.isFriendRequestsLoading = false;
        });
    }

    removeFriendRequestById(friendId: string) {
        this.friendRequestsObjects = this.friendRequestsObjects.filter((friendRequest: any) => {
            return (friendRequest._id != friendId);
        });

        this.eventService.emit(EVENT_TYPE.removeUserFromNavbarSearchCache, friendId)
    }

    removeFriendConfirmById(friendId: string) {
        this.friendConfirmObjects = this.friendConfirmObjects.filter((friendConfirm: any) => {
            return (friendConfirm._id != friendId);
        });
    }

    openUserPage(friendId: string) {
        this.router.navigateByUrl("/profile/" + friendId);
        this.eventService.emit(EVENT_TYPE.hideSidenav, true);
    }
}