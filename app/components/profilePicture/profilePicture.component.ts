import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { ProfilePictureService } from '../../services/profilePicture/profilePicture.service';

@Component({
    selector: 'profilePicture',
    templateUrl: './profilePicture.html',
    providers: [ProfilePictureService]
})

export class ProfilePictureComponent {
    defaultProfileImage: string = "./app/components/profilePicture/pictures/empty-profile.png";
    isUserHasImage: boolean = null;

    @Input() isEditEnable: string;

    constructor(private profilePictureService: ProfilePictureService, private globalService: GlobalService) {
        this.globalService.data.subscribe(value => {
            if (value["newUploadedImage"]) {
                globalService.userProfileImage = value["newUploadedImage"];
                this.isUserHasImage = true;
            }

            if (value["isImageDeleted"]) {
                globalService.userProfileImage = this.defaultProfileImage;
                this.isUserHasImage = false;
                this.globalService.setData("userImage", null);
            }

            if (value["userProfileImageLoaded"]) {
                if (this.globalService.userProfileImage) {
                    this.isUserHasImage = true;
                }
                else {
                    this.isUserHasImage = false;
                }
            }
        });
    }

    OpenEditWindow() {
        if (this.isEditEnable && this.isUserHasImage != null) {
            this.globalService.setData("isOpenProfileEditWindow", true);
        }
    }

}