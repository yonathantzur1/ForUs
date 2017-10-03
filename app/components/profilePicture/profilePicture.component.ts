import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { ProfilePictureService } from '../../services/profilePicture/profilePicture.service';

// Define those variables in order to active events for all instances of that class.
var originalNumOfProfilePictureInstances = 0;
var numOfProfilePictureInstances = 0;

@Component({
    selector: 'profilePicture',
    templateUrl: './profilePicture.html',
    providers: [ProfilePictureService]
})

export class ProfilePictureComponent {
    defaultProfileImage: string = "./app/components/profilePicture/pictures/empty-profile.png";
    profileImageSrc: string = this.defaultProfileImage;
    isUserHasImage: boolean = null;

    @Input() isEditEnable: string;

    constructor(private profilePictureService: ProfilePictureService, private globalService: GlobalService) {
        originalNumOfProfilePictureInstances++;
        numOfProfilePictureInstances++;

        this.globalService.data.subscribe(value => {
            if (value["newUploadedImage"]) {
                this.profileImageSrc = value["newUploadedImage"];
                this.isUserHasImage = true;

                numOfProfilePictureInstances--;

                if (numOfProfilePictureInstances == 0) {
                    delete this.globalService.userProfileImage;
                    numOfProfilePictureInstances = originalNumOfProfilePictureInstances;
                    this.globalService.deleteData("newUploadedImage");
                }
            }

            if (value["isImageDeleted"]) {
                this.profileImageSrc = this.defaultProfileImage;
                this.isUserHasImage = false;

                numOfProfilePictureInstances--;

                if (numOfProfilePictureInstances == 0) {
                    delete this.globalService.userProfileImage;
                    numOfProfilePictureInstances = originalNumOfProfilePictureInstances;
                    this.globalService.deleteData("isImageDeleted");
                    this.globalService.setData("userImage", false);
                }
            }

            if (value["userProfileImageLoaded"]) {
                if (this.globalService.userProfileImage) {
                    this.profileImageSrc = this.globalService.userProfileImage;
                    this.isUserHasImage = true;
                }
                else {
                    this.isUserHasImage = false;
                }

                numOfProfilePictureInstances--;

                if (numOfProfilePictureInstances == 0) {
                    delete this.globalService.userProfileImage;
                    numOfProfilePictureInstances = originalNumOfProfilePictureInstances;
                    this.globalService.deleteData("userProfileImageLoaded");
                }
            }
        });
    }

    OpenEditWindow() {
        if (this.isEditEnable && this.isUserHasImage != null) {
            var userImage;

            // In case the user has image.
            if (this.isUserHasImage) {
                userImage = this.profileImageSrc;
            }
            else {
                userImage = false;
            }

            var changeVariables = [{ "key": "isOpenProfileEditWindow", "value": true },
            { "key": "userImage", "value": userImage }];

            this.globalService.setMultiData(changeVariables);
        }
    }

}