import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService, ALERT_TYPE } from '../../services/global/alert.service';
import { GlobalService } from '../../services/global/global.service';
import { ImageService } from 'src/app/services/global/image.service';
import { SocketService } from '../../services/global/socket.service';
import { EventService, EVENT_TYPE } from '../../services/global/event.service';
import { SearchPageService } from '../../services/searchPage.service';
import { FRIEND_STATUS } from '../../components/userPage/userPage.component';

class FriendsStatus {
    friends: Array<string>;
    get: Array<string>;
    send: Array<string>;
}

@Component({
    selector: 'searchPage',
    templateUrl: './searchPage.html',
    providers: [SearchPageService],
    styleUrls: ['./searchPage.css']
})

export class SearchPageComponent implements OnInit, OnDestroy {

    users: Array<any>;
    isLoading: boolean = false;
    searchString: string;

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        private route: ActivatedRoute,
        public alertService: AlertService,
        private globalService: GlobalService,
        public imageService: ImageService,
        private socketService: SocketService,
        private eventService: EventService,
        private searchPageService: SearchPageService) {
        let self = this;

        //#region events

        eventService.register(EVENT_TYPE.ignoreFriendRequest, (userId: string) => {
            self.unsetUserFriendStatus(userId, FRIEND_STATUS.IS_SEND_FRIEND_REQUEST);
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.sendFriendRequest, (userId: string) => {
            self.setUserFriendStatus(userId, FRIEND_STATUS.IS_GET_FRIEND_REQUEST);
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.removeFriendRequest, (userId: string) => {
            self.unsetUserFriendStatus(userId, FRIEND_STATUS.IS_GET_FRIEND_REQUEST);
        }, self.eventsIds);

        //#endregion
    }

    ngOnInit() {
        let errorJson = {
            title: "שגיאה",
            text: "אופס... שגיאה בטעינת הדף",
            showCancelButton: false,
            type: ALERT_TYPE.DANGER
        }

        // In case of route params changes.
        this.route.params.subscribe(params => {
            this.searchString = params["name"];
            this.eventService.emit(EVENT_TYPE.changeSearchInput, this.searchString);

            // In case the search string is empty.
            if (!this.searchString) {
                return this.router.navigateByUrl('');
            }

            this.users = [];
            this.isLoading = true;
            this.searchPageService.getUserFriendsStatus().then((friendsStatus: FriendsStatus) => {
                if (friendsStatus) {
                    // Search users by given name parameter.
                    this.searchPageService.getSearchResults(this.searchString).then(users => {
                        this.isLoading = false;
                        if (users) {
                            users.forEach((user: any) => {
                                let userId = user._id;

                                // In case the result user and the current user are friends.
                                if (friendsStatus.friends.includes(userId)) {
                                    user.isFriend = true;
                                    return;
                                }
                                // In case the result user sent a friend request to the current user.
                                else if (friendsStatus.get.includes(userId)) {
                                    user.isSendFriendRequest = true;
                                    return;
                                }
                                // In case the current user sent a friend request to the result user.
                                else if (friendsStatus.send.includes(userId)) {
                                    user.isGetFriendRequest = true;
                                    return;
                                }
                            });

                            this.users = users;
                        }
                        else {
                            this.alertService.alert(errorJson);
                        }
                    });
                }
                else {
                    this.isLoading = false;
                    this.alertService.alert(errorJson);
                }
            });
        });

        let self = this;

        self.socketService.socketOn('ClientAddFriend', function (friend: any) {
            self.setUserFriendStatus(friend._id, FRIEND_STATUS.IS_FRIEND);
        });

        self.socketService.socketOn('ClientFriendAddedUpdate', function (friend: any) {
            self.setUserFriendStatus(friend._id, FRIEND_STATUS.IS_FRIEND);
        });

        self.socketService.socketOn('ClientRemoveFriend', function (friendId: string) {
            self.unsetUserFriendStatus(friendId, FRIEND_STATUS.IS_FRIEND);
        });

        self.socketService.socketOn('ClientIgnoreFriendRequest', function (friendId: string) {
            self.unsetUserFriendStatus(friendId, FRIEND_STATUS.IS_GET_FRIEND_REQUEST);
        });

        self.socketService.socketOn('GetFriendRequest', function (friendId: string) {
            self.setUserFriendStatus(friendId, FRIEND_STATUS.IS_SEND_FRIEND_REQUEST);
        });

        self.socketService.socketOn('DeleteFriendRequest', function (friendId: string) {
            self.unsetUserFriendStatus(friendId, FRIEND_STATUS.IS_SEND_FRIEND_REQUEST);
        });

        // In case the user set private user.
        self.socketService.socketOn('UserSetToPrivate', function (userId: string) {
            let user = self.getUserById(userId);

            if (userId != self.getCurrentUserId() && !user.isFriend) {
                self.removeUserFromUsers(userId);
            }
        });
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    resetUserFriendStatus(user: any) {
        user.isFriend = false;
        user.isSendFriendRequest = false;
        user.isGetFriendRequest = false;
    }

    getUserById(userId: string): any {
        for (let i = 0; i < this.users.length; i++) {
            let user = this.users[i];

            if (user._id == userId) {
                return user;
            }
        }

        return null;
    }

    getCurrentUserId() {
        return this.globalService.userId;
    }

    setUserFriendStatus(userId: string, status: FRIEND_STATUS) {
        let user = this.getUserById(userId);

        if (user) {
            this.resetUserFriendStatus(user);
            user[status] = true;
        }
    }

    unsetUserFriendStatus(userId: string, status: FRIEND_STATUS) {
        let user = this.getUserById(userId);

        if (user) {
            user[status] = false;
        }
    }

    userClick(userId: string) {
        this.router.navigateByUrl('/profile/' + userId);
    }

    isFriendRequestAction(user: any) {
        if ((!user.isFriend && this.getCurrentUserId() != user._id) ||
            user.isGetFriendRequest ||
            user.isSendFriendRequest) {
            return true;
        }

        return false;
    }

    addFriendRequest(user: any) {
        this.eventService.emit(EVENT_TYPE.addFriendRequest, user._id);
        user.isGetFriendRequest = true;
    }

    removeFriendRequest(user: any) {
        this.eventService.emit(EVENT_TYPE.removeFriendRequest, user._id);
        user.isGetFriendRequest = false;
    }

    removeUserFromUsers(userId: string) {
        this.users = this.users.filter(user => {
            return (user._id != userId);
        });
    }
}