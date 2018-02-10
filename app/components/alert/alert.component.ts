import { Component, Input } from '@angular/core';

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

}