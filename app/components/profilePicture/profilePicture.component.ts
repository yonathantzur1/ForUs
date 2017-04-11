import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ProfilePictureService } from '../../services/profilePicture/profilePicture.service';

@Component({
    selector: 'profilePicture',
    templateUrl: './profilePicture.html',
    providers: [ProfilePictureService]
})

export class ProfilePictureComponent implements OnInit {
    constructor(private profilePictureService: ProfilePictureService) { }

    profileImageSrc = "./app/components/profilePicture/pictures/empty-profile.png";

    ngOnInit() {
        this.profilePictureService.GetUserProfileImage().then((result) => {
            if (result) {
                this.profileImageSrc = result.image;
            }
        });
    }

}