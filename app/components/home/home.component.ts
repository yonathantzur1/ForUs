import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { AuthService } from '../../services/auth/auth.service';
import { ProfilePictureService } from '../../services/profilePicture/profilePicture.service';
import { HomeService } from '../../services/home/home.service';
import { LOCATION_ERROR } from '../../enums/enums';

@Component({
    selector: 'home',
    templateUrl: './home.html',
    providers: [HomeService, ProfilePictureService],
    styleUrls: ['./home.css']
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
        this.authService.GetCurrUser().then((result: any) => {
            this.currUser = result;
            this.globalService.userId = result._id;
        });

        this.profilePictureService.GetUserProfileImage().then((result: any) => {
            if (result) {
                this.globalService.userProfileImage = result.image;
            }

            this.globalService.setData("userProfileImageLoaded", true);
        });

        var self = this;

        this.GetUserLocation((position: any) => {
            self.homeService.SaveUserLocation(position.coords.latitude, position.coords.longitude);
        }, (error: any) => {
            var errorEnum: LOCATION_ERROR;

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorEnum = LOCATION_ERROR.PERMISSION_DENIED
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorEnum = LOCATION_ERROR.POSITION_UNAVAILABLE
                    break;
                case error.TIMEOUT:
                    errorEnum = LOCATION_ERROR.TIMEOUT
                    break;
                case error.UNKNOWN_ERROR:
                    errorEnum = LOCATION_ERROR.UNKNOWN_ERROR
                    break;
            }

            self.homeService.SaveUserLocationError(errorEnum);
        });
    }

    GetUserLocation(successCallback: any, errorCallback: any) {
        // In case the browser support geo location.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        }
        else {
            this.homeService.SaveUserLocationError(LOCATION_ERROR.BROWSER_NOT_SUPPORT);
        }
    }
}