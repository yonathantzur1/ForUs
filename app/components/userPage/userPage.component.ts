import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { AlertService } from '../../services/alert/alert.service';
import { UserPageService } from '../../services/userPage/userPage.service';

declare function getCookie(name: string): string;
declare var snackbar: Function;

@Component({
    selector: 'userPage',
    templateUrl: './userPage.html',
    providers: [UserPageService]
})

export class UserPageComponent implements OnInit, OnDestroy {
    isLoading: boolean;
    user: any;
    options: any;

    subscribeObj: any;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private userPageService: UserPageService,
        private alertService: AlertService,
        private globalService: GlobalService) {
        this.subscribeObj = this.globalService.data.subscribe((value: any) => {
            if (value["newUploadedImage"]) {
                if (!this.user.profileImage) {
                    this.user.profileImage = {};
                }

                this.user.profileImage.image = value["newUploadedImage"];
            }

            if (value["isImageDeleted"]) {
                delete this.user.profileImage;
            }
        });

        var self = this;

        self.options = [
            {
                id: "removeFriend",
                icon: "fa fa-minus-square-o",
                innerIconText: "",
                isShow: function () {
                    return self.user.isFriend;
                },
                onClick: function () {
                    self.alertService.Alert({
                        title: "הסרת חברות",
                        text: "האם להסיר את החברות עם " + self.user.fullName + "?",
                        type: "warning",
                        confirmFunc: function () {
                            self.userPageService.RemoveFriends(self.user._id).then(result => {
                                if (result) {
                                    self.globalService.socket.emit("ServerRemoveFriend", self.user._id);
                                    self.UnsetUserFriendStatus("isFriend");
                                    snackbar("הסרת החברות עם " + self.user.fullName + " בוצעה בהצלחה");
                                    self.globalService.RefreshSocket();
                                }
                                else {
                                    self.alertService.Alert({
                                        title: "שגיאה בהסרת החברות",
                                        text: "אירעה שגיאה בהסרת החברות עם " + self.user.fullName,
                                        type: "warning",
                                        showCancelButton: false
                                    });
                                }
                            });
                        }
                    });
                }
            },
            {
                id: "addFriendRequest",
                icon: "fa fa-user-plus",
                innerIconText: "",
                isShow: function () {
                    return (!self.user.isFriend &&
                        !self.user.isGetFriendRequest &&
                        !self.user.isSendFriendRequest);
                },
                onClick: function () {
                    self.SetUserFriendStatus("isGetFriendRequest");
                    self.globalService.setData("AddFriendRequest", self.user._id);
                }
            },
            {
                id: "removeFriendRequest",
                icon: "fa fa-user-times",
                innerIconText: "",
                isShow: function () {
                    return self.user.isGetFriendRequest;
                },
                onClick: function () {
                    self.UnsetUserFriendStatus("isGetFriendRequest");
                    self.globalService.setData("RemoveFriendRequest", self.user._id);
                }
            },
            {
                id: "openChat",
                icon: "fa fa-pencil-square-o",
                innerIconText: "",
                isShow: function () {
                    return self.user.isFriend;
                },
                onClick: function () {
                    self.globalService.setData("openChat", self.user);
                }
            },
            {
                id: "wave",
                icon: "fa fa-hand-paper-o",
                innerIconText: "",
                isShow: function () {
                    return self.user.isFriend;
                },
                onClick: function () {

                }
            },
            {
                id: "menu",
                icon: "material-icons",
                innerIconText: "menu",
                onClick: function () {

                }
            }
        ]
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.userPageService.GetUserDetails(params["id"]).then((user: any) => {
                if (user) {
                    user.fullName = user.firstName + " " + user.lastName;
                    this.InitializePage(user);
                }
            });
        });

        var self = this;

        self.globalService.SocketOn('ClientAddFriend', function (friend: any) {
            if (friend._id == self.user._id) {
                self.SetUserFriendStatus("isFriend");
            }
        });

        self.globalService.SocketOn('ClientFriendAddedUpdate', function (friend: any) {
            if (friend._id == self.user._id) {
                self.SetUserFriendStatus("isFriend");
            }
        });

        self.globalService.SocketOn('ClientRemoveFriend', function (friendId: string) {
            if (friendId == self.user._id) {
                self.UnsetUserFriendStatus("isFriend");
            }
        });

        self.globalService.SocketOn('ClientIgnoreFriendRequest', function (friendId: string) {
            if (friendId == self.user._id) {
                self.UnsetUserFriendStatus("isGetFriendRequest");
            }
        });

        // In case the user has been removed from the site.
        self.globalService.SocketOn('ClientRemoveFriendUser', function (friendId: string) {
            if (friendId == self.user._id) {
                self.router.navigateByUrl("/");
            }
        });
    }

    ngOnDestroy() {
        this.subscribeObj.unsubscribe();
    }

    InitializePage(user: any) {
        this.globalService.setData("changeSearchInput", user.firstName + " " + user.lastName);
        this.user = user;
    }

    UnsetUserFriendStatus(field: string) {
        // Set the requested field to true.
        this.user[field] = false;
    }

    SetUserFriendStatus(field: string) {
        this.user.isFriend = false;
        this.user.isGetFriendRequest = false;
        this.user.isSendFriendRequest = false;

        // Set the requested field to true.
        this.user[field] = true;
    }

    GetOptions() {
        return this.options.filter((option: any) => {
            if (!option.isShow) {
                return true;
            }
            else {
                return option.isShow();
            }
        })
    }

    // Return true if the user page belongs to the current user.
    IsUserPageSelf() {
        return (this.user && this.user.uid == getCookie(this.globalService.uidCookieName));
    }

    OpenEditWindow() {
        if (this.IsUserPageSelf()) {
            this.globalService.setData("openProfileEditWindow", true);
        }
    }
}