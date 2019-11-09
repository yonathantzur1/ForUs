import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { ImageService } from 'src/app/services/global/image.service';
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
        private globalService: GlobalService,
        private imageService: ImageService) { }

    ngOnInit() {
        Promise.all([
            this.authService.getCurrUser(),
            this.profilePictureService.getUserProfileImage()
        ]).then(results => {
            // Assign user object.
            this.currUser = results[0];
            this.globalService.userId = this.currUser._id;

            // Assign user profile image.
            let userProfileImage = results[1];

            if (userProfileImage) {
                this.imageService.userProfileImage = userProfileImage.image;
            }
        });
    }
}