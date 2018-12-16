import { Component, OnInit, HostListener } from '@angular/core';

import { AlertService, ALERT_TYPE } from '../../../services/alert/alert.service';
import { GlobalService } from '../../../services/global/global.service';
import { UserPrivacyWindowService } from '../../../services/userPage/userPrivacyWindow/userPrivacyWindow.service';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';

declare var $: any;

@Component({
    selector: 'userPrivacyWindow',
    templateUrl: './userPrivacyWindow.html',
    providers: [UserPrivacyWindowService],
    styleUrls: ['./userPrivacyWindow.css']
})

export class UserPrivacyWindowComponent implements OnInit {

    isUserPrivate: boolean;
    isLoading: boolean = false;

    constructor(private userPrivacyWindowService: UserPrivacyWindowService,
        private alertService: AlertService,
        private globalService: GlobalService,
        private snackbarService: SnackbarService) { }

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
        this.globalService.setData("closeUserPrivacyWindow", true);
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
                    this.snackbarService.Snackbar("משתמש פרטי - " + (this.isUserPrivate ? "פעיל" : "כבוי"));
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