import { Component, Input } from '@angular/core';

import { AlertService } from '../../services/alert/alert.service';

@Component({
    selector: 'alert',
    templateUrl: './alert.html',
    providers: []
})

export class AlertComponent {

    constructor(private alertService: AlertService) { }

    ConfirmClick() {
        this.alertService.Confirm();
    }

    CloseClick() {
        this.alertService.Close();
    }

}