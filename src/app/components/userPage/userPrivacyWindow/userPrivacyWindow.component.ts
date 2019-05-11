import { Component, OnInit, HostListener } from '@angular/core';

import { AlertService, ALERT_TYPE } from '../../../services/alert/alert.service';
import { GlobalService } from '../../../services/global/global.service';
import { EventService } from '../../../services/event/event.service';
import { UserPrivacyWindowService } from '../../../services/userPage/userPrivacyWindow/userPrivacyWindow.service';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';

declare var $: any;

@Component({
    selector: 'userPrivacyWindow',
    templateUrl: './userPrivacyWindow.html',
    providers: [UserPrivacyWindowService],
    styleUrls: ['./userPrivacyWindow.css', '../userWindow.css']
})

export class UserPrivacyWindowComponent implements OnInit {

    isUserPrivate: boolean;
    isLoading: boolean = false;

    constructor(private userPrivacyWindowService: UserPrivacyWindowService,
        public alertService: AlertService,
        public globalService: GlobalService,
        private eventService: EventService,
        public snackbarService: SnackbarService) { }

    ngOnInit() {
        this.isLoading = true;
        this.userPrivacyWindowService.GetUserPrivacyStatus().then((isUserPrivate: boolean) => {
            this.isLoading = false;

            if (isUserPrivate != null) {
                this.isUserPrivate = isUserPrivate;
            }
            else {
                this.alertService.Alert({
                    title: "שגיאה",
                    text: "אופס... שגיאה בטעינת סטטוס הפרטיות",
                    showCancelButton: false,
                    type: ALERT_TYPE.DANGER
                });
                this.CloseWindow();
            }
        });
    }

    CloseWindow() {
        this.eventService.Emit("closeUserPrivacyWindow");
    }

    ChangePrivacyStatus() {
        var self = this;

        setTimeout(function () {
            self.isUserPrivate = !self.isUserPrivate;
        }, 0);
    }

    SavePrivacyStatus() {
        !this.isLoading &&
            this.userPrivacyWindowService.SetUserPrivacy(this.isUserPrivate).then(result => {
                if (result) {
                    this.CloseWindow();
                }
                else {
                    this.alertService.Alert({
                        title: "שגיאה",
                        text: "אופס... שגיאה בשמירת סטטוס הפרטיות",
                        showCancelButton: false,
                        type: ALERT_TYPE.DANGER
                    });
                }
            });
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        // In case of pressing escape.
        if (event.code == "Escape") {
            this.CloseWindow();
        }
    }
}