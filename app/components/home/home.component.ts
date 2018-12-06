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
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    var a = "User denied the request for Geolocation."
                    break;
                case error.POSITION_UNAVAILABLE:
                    var a = "Location information is unavailable."
                    break;
                case error.TIMEOUT:
                    var a = "The request to get user location timed out."
                    break;
                case error.UNKNOWN_ERROR:
                    var a = "An unknown error occurred."
                    break;
            }
        });
    }

    GetUserLocation(successCallback: any, errorCallback: any) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successCallback);
        }
        else {
            var a = "Geolocation is not supported by this browser.";
        }
    }
}