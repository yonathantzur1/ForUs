import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { EventService } from '../../services/global/event.service';
import { AuthService } from '../../services/global/auth.service';
import { ProfilePictureService } from '../../services/profilePicture.service';
import { HomeService } from '../../services/home.service';

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
        Promise.all([
            this.authService.GetCurrUser(),
            this.profilePictureService.GetUserProfileImage()
        ]).then(results => {
            // Assign user object.
            this.currUser = results[0];
            this.globalService.userId = this.currUser._id;

            // Assign user profile image.
            let userProfileImage = results[1];

            if (userProfileImage) {
                this.globalService.userProfileImage = userProfileImage.image;
            }
        });
    }
}