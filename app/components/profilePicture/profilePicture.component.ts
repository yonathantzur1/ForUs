import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { ProfilePictureService } from '../../services/profilePicture/profilePicture.service';

@Component({
    selector: 'profilePicture',
    templateUrl: './profilePicture.html',
    providers: [ProfilePictureService]
})

export class ProfilePictureComponent implements OnInit {
    defaultProfileImage: string = "./app/components/profilePicture/pictures/empty-profile.png";
    profileImageSrc: string = this.defaultProfileImage;
    isUserHasImage: boolean = null;

    @Input() isEditEnable: string;

    constructor(private profilePictureService: ProfilePictureService, private globalService: GlobalService) {
        this.globalService.data.subscribe(value => {
            if (value["newUploadedImage"]) {
                this.profileImageSrc = value["newUploadedImage"];
                this.isUserHasImage = true;
                this.globalService.deleteData("newUploadedImage");
            }

            if (value["isImageDeleted"]) {
                this.profileImageSrc = this.defaultProfileImage;
                this.isUserHasImage = false;
                this.globalService.deleteData("isImageDeleted");
                this.globalService.setData("userImage", false);
            }
        });
    }

    ngOnInit() {
        this.profilePictureService.GetUserProfileImage().then((result) => {
            if (result) {
                this.isUserHasImage = true;
                this.profileImageSrc = result.image;
            }
            else {
                this.isUserHasImage = false;
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

            var changeVariables = [{ "key": "isOpenEditWindow", "value": true },
            { "key": "userImage", "value": userImage }];

            this.globalService.setMultiData(changeVariables);
        }
    }

}