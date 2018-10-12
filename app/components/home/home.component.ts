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

    isOpenProfileEditWindow = false;
    currUser: any = null;

    constructor(private router: Router,
        private authService: AuthService,
        private profilePictureService: ProfilePictureService,
        private homeService: HomeService,
        private globalService: GlobalService) { }

    ngOnInit() {
        var self = this;

        self.authService.GetCurrUser().then((result: any) => {
            self.currUser = result;
            self.globalService.userId = result._id;
        });

        self.profilePictureService.GetUserProfileImage().then((result: any) => {
            if (result) {
                self.globalService.userProfileImage = result.image;
            }

            self.globalService.setData("userProfileImageLoaded", true);
        });
    }
}