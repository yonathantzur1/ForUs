import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService, ALERT_TYPE } from '../../services/alert/alert.service';
import { GlobalService } from '../../services/global/global.service';
import { SearchPageService } from '../../services/searchPage/searchPage.service';

class FriendsStatus {
    friends: Array<string>;
    get: Array<string>;
    send: Array<string>;
}

@Component({
    selector: 'searchPage',
    templateUrl: './searchPage.html',
    providers: [SearchPageService]
})

export class SearchPage implements OnInit {

    users: Array<any>;
    isLoading: boolean = false;
    searchString: string;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private alertService: AlertService,
        private globalService: GlobalService,
        private searchPageService: SearchPageService) { }

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
                                    }
                                    // In case the result user sent a friend request to the current user.
                                    else if (friendsStatus.get.indexOf(userId) != -1) {
                                        user.isSendFriendRequest = true;
                                    }
                                    // In case the current user sent a friend request to the result user.
                                    else if (friendsStatus.send.indexOf(userId) != -1) {
                                        user.isGetFriendRequest = true;
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
    }

    UserClick(userId: string) {
        this.router.navigateByUrl('/profile/' + userId);
    }

    isFriendRequestAction(user: any) {
        if ((!user.isFriend && this.globalService.userId != user._id) ||
            user.isGetFriendRequest ||
            user.isSendFriendRequest) {
            return true;
        }

        return false;
    }

    AddFriendRequest(user: any) {
        this.globalService.setData("addFriendRequest", user._id);
        user.isGetFriendRequest = true;
    }

    RemoveFriendRequest(user: any) {
        this.globalService.setData("removeFriendRequest", user._id);
        user.isGetFriendRequest = false;
    }
}