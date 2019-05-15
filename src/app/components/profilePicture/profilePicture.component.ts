import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { GlobalService } from '../../services/global/global.service';
import { EventService } from '../../services/event/event.service';

@Component({
    selector: 'profilePicture',
    templateUrl: './profilePicture.html',
    providers: [],
    styleUrls: ['./profilePicture.css']
})

export class ProfilePictureComponent implements OnInit, OnDestroy {
    @Input() isEditEnable: string;    

    eventsIds: Array<string> = [];

    constructor(public globalService: GlobalService,
        private eventService: EventService) { }

    ngOnInit() {
        let self = this;

        //#region events
        self.eventService.Register("newUploadedImage", (img: string) => {
            self.globalService.userProfileImage = img;
        }, self.eventsIds);

        self.eventService.Register("deleteProfileImage", () => {
            self.globalService.userProfileImage = null;
        }, self.eventsIds);

        self.eventService.Register("openProfileEditWindow", () => {
            self.OpenEditWindow();
        }, self.eventsIds);
        //#endregion
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    }

    OpenEditWindow() {
        if (this.isEditEnable) {
            this.eventService.Emit("showProfileEditWindow", true);
        }
    }

}