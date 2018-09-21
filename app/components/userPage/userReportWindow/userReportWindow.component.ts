import { Component, Input, OnInit } from '@angular/core';

import { UserReportWindowService } from '../../../services/userPage/userReportWindow/userReportWindow.service';
import { AlertService, ALERT_TYPE } from '../../../services/alert/alert.service';
import { GlobalService } from '../../../services/global/global.service';
import { MicrotextService, InputFieldValidation } from '../../../services/microtext/microtext.service';


@Component({
    selector: 'userReportWindow',
    templateUrl: './userReportWindow.html',
    providers: [UserReportWindowService]
})

export class UserReportWindow implements OnInit {
    @Input() user: any;

    constructor(private userReportWindowService: UserReportWindowService,
        private alertService: AlertService,
        private globalService: GlobalService,
        private microtextService: MicrotextService) { }

    ngOnInit() {

    }

    CloseWindow() {
        this.globalService.setData("closeUserReportWindow", true);
    }
    
}