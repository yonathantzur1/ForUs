import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { ProfilePictureService } from '../../services/profilePicture/profilePicture.service';

@Component({
    selector: 'profilePicture',
    templateUrl: './profilePicture.html',
    providers: [ProfilePictureService]
})

export class ProfilePictureComponent implements OnInit {
    isOpen: boolean;
    profileImageSrc = "./app/components/profilePicture/pictures/empty-profile.png";

    constructor(private profilePictureService: ProfilePictureService, private globalService: GlobalService) {
        this.globalService.data.subscribe(value => {
            if (value["newUploadedImage"]) {
                this.profileImageSrc = value["newUploadedImage"];
                this.globalService.deleteData("newUploadedImage");
            }
        });
    }

    ngOnInit() {
        this.profilePictureService.GetUserProfileImage().then((result) => {
            if (result) {
                this.profileImageSrc = result.image;
            }
        });
    }

}