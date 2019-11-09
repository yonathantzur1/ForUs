import { Component, OnInit, HostListener } from '@angular/core';

import { AlertService, ALERT_TYPE } from '../../../services/global/alert.service';
import { EventService, EVENT_TYPE } from '../../../services/global/event.service';
import { UserPrivacyWindowService } from '../../../services/userPage/userPrivacyWindow.service';
import { SnackbarService } from '../../../services/global/snackbar.service';

declare let $: any;

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

                this.closeWindow();
            }
        });
    }

    closeWindow() {
        this.eventService.Emit(EVENT_TYPE.closeUserPrivacyWindow);
    }

    changePrivacyStatus() {
        this.isUserPrivate = !this.isUserPrivate;
    }

    savePrivacyStatus() {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        this.userPrivacyWindowService.SetUserPrivacy(this.isUserPrivate).then(result => {
            this.isLoading = false;

            if (result) {
                this.closeWindow();
                let privacyStatus = this.isUserPrivate ? "פעיל" : "כבוי";
                this.snackbarService.Snackbar("משתמש פרטי " + privacyStatus)
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
            this.closeWindow();
        }
    }
}