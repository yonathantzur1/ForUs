import { Component, OnInit, HostListener } from '@angular/core';

import { AlertService, ALERT_TYPE } from '../../../services/alert/alert.service';
import { GlobalService } from '../../../services/global/global.service';
import { UserPrivacyWindowService } from '../../../services/userPage/userPrivacyWindow/userPrivacyWindow.service';

declare var $: any;

@Component({
    selector: 'userPrivacyWindow',
    templateUrl: './userPrivacyWindow.html',
    providers: [UserPrivacyWindowService]
})

export class UserPrivacyWindowComponent implements OnInit {

    isUserPrivate: boolean;
    toggleInputId: string = "toggle-input";

    constructor(private userPrivacyWindowService: UserPrivacyWindowService,
        private alertService: AlertService,
        private globalService: GlobalService) { }

    ngOnInit() {
        this.userPrivacyWindowService.GetUserPrivacyStatus().then((isUserPrivate: boolean) => {
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
            }
        });
    }

    SetUserPrivacy(isPrivate: boolean) {
        this.userPrivacyWindowService.SetUserPrivacy(isPrivate).then(result => {
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
        this.userPrivacyWindowService.SetUserPrivacy(this.isUserPrivate).then(result => {
            this.CloseWindow();
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