import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { EventService } from '../../services/global/event.service';
import { ImageService } from 'src/app/services/global/image.service';

@Component({
    selector: 'profilePicture',
    templateUrl: './profilePicture.html',
    providers: [],
    styleUrls: ['./profilePicture.css']
})

export class ProfilePictureComponent implements OnInit, OnDestroy {
    @Input() isEditEnable: string;
    eventsIds: Array<string> = [];

    constructor(public imageService: ImageService,
        private eventService: EventService) { }

    ngOnInit() {
        let self = this;

        //#region events

        self.eventService.Register("newUploadedImage", (img: string) => {
            self.imageService.userProfileImage = img;
        }, self.eventsIds);

        self.eventService.Register("deleteProfileImage", () => {
            self.imageService.DeleteUserProfileImage();
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