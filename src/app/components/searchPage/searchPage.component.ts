import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService, ALERT_TYPE } from '../../services/alert/alert.service';
import { GlobalService } from '../../services/global/global.service';
import { EventService } from '../../services/event/event.service';
import { SearchPageService } from '../../services/searchPage/searchPage.service';

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
        public globalService: GlobalService,
        private eventService: EventService,
        private searchPageService: SearchPageService) {
        var self = this;

        //#region events
        eventService.Register("ignoreFriendRequest", (userId: string) => {
            self.UnsetUserFriendStatus(userId, "isSendFriendRequest");
        }, self.eventsIds);

        eventService.Register("sendFriendRequest", (userId: string) => {
            self.SetUserFriendStatus(userId, "isGetFriendRequest");
        }, self.eventsIds);

        eventService.Register("removeFriendRequest", (userId: string) => {
            self.UnsetUserFriendStatus(userId, "isGetFriendRequest");
        }, self.eventsIds);
        //#endregion
    }

    ngOnInit() {
        var errorJson = {
            title: "שגיאה",
            text: "אופס... שגיאה בטעינת הדף",
            showCancelButton: false,
            type: ALERT_TYPE.DANGER
        }

        // In case of route params changes.
        this.route.params.subscribe(params => {
            this.searchString = params["name"];
            this.eventService.Emit("changeSearchInput", this.searchString);

            // In case there is a search string.
            if (this.searchString) {
                this.users = [];
                this.isLoading = true;
                this.searchPageService.GetUserFriendsStatus().then((friendsStatus: FriendsStatus) => {
                    if (friendsStatus) {
                        // Search users by given name parameter.
                        this.searchPageService.GetSearchResults(this.searchString).then(users => {
                            this.isLoading = false;
                            if (users) {
                                users.forEach((user: any) => {
                                    var userId = user._id;

                                    // In case the result user and the current user are friends.
                                    if (friendsStatus.friends.indexOf(userId) != -1) {
                                        user.isFriend = true;
                                        return;
                                    }
                                    // In case the result user sent a friend request to the current user.
                                    else if (friendsStatus.get.indexOf(userId) != -1) {
                                        user.isSendFriendRequest = true;
                                        return;
                                    }
                                    // In case the current user sent a friend request to the result user.
                                    else if (friendsStatus.send.indexOf(userId) != -1) {
                                        user.isGetFriendRequest = true;
                                        return;
                                    }
                                });

                                this.users = users;
                            }
                            else {
                                this.alertService.Alert(errorJson);
                            }
                        });
                    }
                    else {
                        this.isLoading = false;
                        this.alertService.Alert(errorJson);
                    }
                });
            }
            else {
                this.router.navigateByUrl('');
            }
        });

        var self = this;

        self.globalService.SocketOn('ClientAddFriend', function (friend: any) {
            self.SetUserFriendStatus(friend._id, "isFriend");
        });

        self.globalService.SocketOn('ClientFriendAddedUpdate', function (friend: any) {
            self.SetUserFriendStatus(friend._id, "isFriend");
        });

        self.globalService.SocketOn('ClientRemoveFriend', function (friendId: string) {
            self.UnsetUserFriendStatus(friendId, "isFriend");
        });

        self.globalService.SocketOn('ClientIgnoreFriendRequest', function (friendId: string) {
            self.UnsetUserFriendStatus(friendId, "isGetFriendRequest");
        });

        self.globalService.SocketOn('GetFriendRequest', function (friendId: string) {
            self.SetUserFriendStatus(friendId, "isSendFriendRequest");
        });

        self.globalService.SocketOn('DeleteFriendRequest', function (friendId: string) {
            self.UnsetUserFriendStatus(friendId, "isSendFriendRequest");
        });

        // In case the user set private user.
        self.globalService.SocketOn('UserSetToPrivate', function (userId: string) {
            var user = self.GetUserById(userId);

            if (userId != self.GetCurrentUserId() && !user.isFriend) {
                self.RemoveUserFromUsers(userId);
            }
        });
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    }

    ResetUserFriendStatus(user: any) {
        user.isFriend = false;
        user.isSendFriendRequest = false;
        user.isGetFriendRequest = false;
    }

    GetUserById(userId: string): any {
        for (var i = 0; i < this.users.length; i++) {
            var user = this.users[i];

            if (user._id == userId) {
                return user;
            }
        }

        return null;
    }

    GetCurrentUserId() {
        return this.globalService.userId;
    }

    SetUserFriendStatus(userId: string, statusName: string) {
        var user = this.GetUserById(userId);

        if (user) {
            this.ResetUserFriendStatus(user);
            user[statusName] = true;
        }
    }

    UnsetUserFriendStatus(userId: string, statusName: string) {
        var user = this.GetUserById(userId);

        if (user) {
            user[statusName] = false;
        }
    }

    UserClick(userId: string) {
        this.router.navigateByUrl('/profile/' + userId);
    }

    IsFriendRequestAction(user: any) {
        if ((!user.isFriend && this.GetCurrentUserId() != user._id) ||
            user.isGetFriendRequest ||
            user.isSendFriendRequest) {
            return true;
        }

        return false;
    }

    AddFriendRequest(user: any) {
        this.eventService.Emit("addFriendRequest", user._id);
        user.isGetFriendRequest = true;
    }

    RemoveFriendRequest(user: any) {
        this.eventService.Emit("removeFriendRequest", user._id);
        user.isGetFriendRequest = false;
    }

    RemoveUserFromUsers(userId: string) {
        this.users = this.users.filter(user => {
            return (user._id != userId);
        });
    }
}