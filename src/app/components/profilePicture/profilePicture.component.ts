import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { EventService, EVENT_TYPE } from '../../services/global/event.service';
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

        self.eventService.Register(EVENT_TYPE.newUploadedImage, (img: string) => {
            self.imageService.userProfileImage = img;
        }, self.eventsIds);

        self.eventService.Register(EVENT_TYPE.deleteProfileImage, () => {
            self.imageService.DeleteUserProfileImage();
        }, self.eventsIds);

        self.eventService.Register(EVENT_TYPE.openProfileEditWindow, () => {
            self.OpenEditWindow();
        }, self.eventsIds);

        //#endregion
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    }

    OpenEditWindow() {
        if (this.isEditEnable) {
            this.eventService.Emit(EVENT_TYPE.showProfileEditWindow, true);
        }
    }

}