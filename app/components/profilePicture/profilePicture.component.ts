import { Component, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { ProfilePictureService } from '../../services/profilePicture/profilePicture.service';

declare var globalVariables: any;

@Component({
    selector: 'profilePicture',
    templateUrl: './profilePicture.html',
    providers: [ProfilePictureService]
})

export class ProfilePictureComponent implements OnDestroy {
    defaultProfileImage: string = "./app/components/profilePicture/pictures/empty-profile.png";
    isUserHasImage: boolean = null;
    isTouchDevice: boolean = globalVariables.isTouchDevice;

    @Input() isEditEnable: string;

    subscribeObj: any;

    constructor(private profilePictureService: ProfilePictureService, private globalService: GlobalService) {
        this.subscribeObj = this.globalService.data.subscribe(value => {
            if (value["newUploadedImage"]) {
                globalService.userProfileImage = value["newUploadedImage"];
                this.isUserHasImage = true;
            }

            if (value["isImageDeleted"]) {
                globalService.userProfileImage = null;
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

    ngOnDestroy() {
        this.subscribeObj.unsubscribe();
    }

    OpenEditWindow() {
        if (this.isEditEnable && this.isUserHasImage != null) {
            this.globalService.setData("isOpenProfileEditWindow", true);
        }
    }

}