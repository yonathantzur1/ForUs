import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { UserPageService } from '../../services/userPage/userPage.service';

declare function getCookie(name: string): string;

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

    constructor(private route: ActivatedRoute,
        private userPageService: UserPageService,
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
                id: "addFriend",
                iconCalc: function () {
                    return (self.user && self.user.isFriend) ? "fa fa-user-times" : "fa fa-user-plus";
                },
                innerIconText: "",
                onClick: function () {

                }
            },
            {
                id: "openChat",
                icon: "fa fa-pencil-square-o",
                innerIconText: "",
                onClick: function () {

                }
            },
            {
                id: "wave",
                icon: "fa fa-hand-paper-o",
                innerIconText: "",
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
                user && this.InitializePage(user);
            });
        });
    }

    ngOnDestroy() {
        this.subscribeObj.unsubscribe();
    }

    InitializePage(user: any) {
        this.globalService.setData("changeSearchInput", user.firstName + " " + user.lastName);
        this.user = user;
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