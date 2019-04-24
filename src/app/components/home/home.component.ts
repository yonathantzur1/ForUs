import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { EventService } from '../../services/event/event.service';
import { AuthService } from '../../services/auth/auth.service';
import { ProfilePictureService } from '../../services/profilePicture/profilePicture.service';
import { HomeService } from '../../services/home/home.service';

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
        public globalService: GlobalService,
        private eventService: EventService) { }

    ngOnInit() {
        this.authService.GetCurrUser().then((result: any) => {
            this.currUser = result;
            this.globalService.userId = result._id;
        });

        this.profilePictureService.GetUserProfileImage().then((result: any) => {
            if (result) {
                this.globalService.userProfileImage = result.image;
            }

            this.eventService.Emit("userProfileImageLoaded", true);
        });
    }
}