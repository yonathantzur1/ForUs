import { Component, Input, HostListener } from '@angular/core';

import { AlertService, AlertType } from '../../services/alert/alert.service';

@Component({
    selector: 'alert',
    templateUrl: './alert.html',
    providers: []
})

export class AlertComponent {

    alertType = AlertType;

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
        if (event.keyCode == 27) {
            this.CloseClick();
        }
    }
}