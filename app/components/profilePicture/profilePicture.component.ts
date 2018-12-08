import { Component, Input, OnDestroy } from '@angular/core';

import { GlobalService } from '../../services/global/global.service';

@Component({
    selector: 'profilePicture',
    templateUrl: './profilePicture.html',
    providers: []
})

export class ProfilePictureComponent implements OnDestroy {
    @Input() isEditEnable: string;
    isUserHasImage: boolean;

    subscribeObj: any;

    constructor(private globalService: GlobalService) {
        this.subscribeObj = this.globalService.data.subscribe((value: any) => {
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

            if (value["openProfileEditWindow"]) {
                this.OpenEditWindow();
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