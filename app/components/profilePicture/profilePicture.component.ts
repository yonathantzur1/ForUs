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
    profileImageSrc = "./app/components/profilePicture/pictures/empty-profile.png";

    constructor(private profilePictureService: ProfilePictureService, private globalService: GlobalService) {
        this.globalService.data.subscribe(value => {
            if (value["newUploadedImage"]) {
                this.profileImageSrc = value["newUploadedImage"];
                this.globalService.deleteData("newUploadedImage");
            }
        });
    }

    @Input() isEditEnable: string;

    isUserHasImage: boolean = null;

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
        if (this.isEditEnable) {
            var userImage;

            // In case the user has image.
            if (this.isUserHasImage) {
                userImage = this.profileImageSrc;
            }
            else {
                userImage = false;
            }

            var changeVariables = [{ "key": "isOpenEditWindow", "value": true },
            { "key": "userImage", "value":  userImage}];

            this.globalService.setMultiData(changeVariables);
        }
    }

}