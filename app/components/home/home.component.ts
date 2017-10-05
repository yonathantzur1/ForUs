import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { AuthService } from '../../services/auth/auth.service';
import { ProfilePictureService } from '../../services/profilePicture/profilePicture.service';
import { HomeService } from '../../services/home/home.service';

@Component({
    selector: 'home',
    templateUrl: './home.html',
    providers: [HomeService, ProfilePictureService]
})

export class HomeComponent implements OnInit {
    constructor(private router: Router,
        private authService: AuthService,
        private profilePictureService: ProfilePictureService,
        private homeService: HomeService,
        private globalService: GlobalService) {
        this.globalService.data.subscribe(value => {
            if (value["isOpenProfileEditWindow"] == true ||
                value["isOpenProfileEditWindow"] == false) {
                this.isOpenProfileEditWindow = value["isOpenProfileEditWindow"];
            }
        });
    }

    isOpenProfileEditWindow = false;
    currUser: any = null;

    ngOnInit() {
        var self = this;

        self.authService.GetCurrUser().then((result) => {
            self.currUser = result;
        });

        self.profilePictureService.GetUserProfileImage().then(function (result) {
            if (result) {
                self.globalService.userProfileImage = result.image;
            }

            self.globalService.setData("userProfileImageLoaded", true);
        });
    }
}