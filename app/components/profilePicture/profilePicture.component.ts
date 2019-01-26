import { Component, Input, OnDestroy } from '@angular/core';

import { GlobalService } from '../../services/global/global.service';
import { EventService } from '../../services/event/event.service';

@Component({
    selector: 'profilePicture',
    templateUrl: './profilePicture.html',
    providers: [],
    styleUrls: ['./profilePicture.css']
})

export class ProfilePictureComponent implements OnDestroy {
    @Input() isEditEnable: string;
    isUserHasImage: boolean;

    eventsIds: Array<string> = [];

    constructor(private globalService: GlobalService,
        private eventService: EventService) {

        var self = this;

        //#region events

        eventService.Register("newUploadedImage", (img: string) => {
            globalService.userProfileImage = img;
            self.isUserHasImage = true;
        }, self.eventsIds);

        eventService.Register("deleteProfileImage", () => {
            globalService.userProfileImage = null;
            self.isUserHasImage = false;
        }, self.eventsIds);

        eventService.Register("userProfileImageLoaded", () => {
            self.isUserHasImage = self.globalService.userProfileImage ? true : false;
        }, self.eventsIds);

        eventService.Register("openProfileEditWindow", () => {
            self.OpenEditWindow();
        }, self.eventsIds);

        //#endregion
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    OpenEditWindow() {
        if (this.isEditEnable && this.isUserHasImage != null) {
            this.eventService.Emit("showProfileEditWindow", true);
        }
    }

}