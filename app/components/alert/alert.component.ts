import { Component, HostListener } from '@angular/core';

import { AlertService, ALERT_TYPE } from '../../services/alert/alert.service';

@Component({
    selector: 'alert',
    templateUrl: './alert.html',
    providers: []
})

export class AlertComponent {

    ALERT_TYPE = ALERT_TYPE;

    constructor(private alertService: AlertService) { }

    ConfirmClick() {
        !this.alertService.isLoading && this.alertService.Confirm();
    }

    CloseClick() {
        !this.alertService.isLoading && this.alertService.Close();
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        // In case of pressing escape.
        if (event.code == "Escape") {
            this.CloseClick();
        }
    }
}