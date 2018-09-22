import { Component, Input, OnInit } from '@angular/core';

import { UserReportWindowService } from '../../../services/userPage/userReportWindow/userReportWindow.service';
import { AlertService, ALERT_TYPE } from '../../../services/alert/alert.service';
import { GlobalService } from '../../../services/global/global.service';
import { MicrotextService, InputFieldValidation } from '../../../services/microtext/microtext.service';

class ReportReason {
    _id: string;
    name: string;
    isClicked: boolean;
}

@Component({
    selector: 'userReportWindow',
    templateUrl: './userReportWindow.html',
    providers: [UserReportWindowService]
})

export class UserReportWindow implements OnInit {
    @Input() user: any;
    reportReasons: Array<ReportReason>;
    isShowTextReasonWindow: boolean = false;

    constructor(private userReportWindowService: UserReportWindowService,
        private alertService: AlertService,
        private globalService: GlobalService,
        private microtextService: MicrotextService) { }

    ngOnInit() {
        this.userReportWindowService.GetAllReportReasons().then((result: Array<ReportReason>) => {
            if (result) {
                this.reportReasons = result;
                this.InitializeReasonButtons();
            }
            else {

            }
        });
    }

    CloseWindow() {
        this.globalService.setData("closeUserReportWindow", true);
    }

    InitializeReasonButtons() {
        this.reportReasons.forEach((reason) => {
            reason.isClicked = false;
        });
    }

    ClickReasonButton(btn: ReportReason) {
        // Disable selected btn in case it is already clicked.
        if (btn.isClicked) {
            btn.isClicked = false;
        }
        else {
            this.InitializeReasonButtons();
            btn.isClicked = true;
        }
    }

    IsDisableReportBtn() {
        for (var i = 0; i < this.reportReasons.length; i++) {
            if (this.reportReasons[i].isClicked) {
                return false;
            }
        }

        return true;
    }

    ShowTextReasonWindow() {
        if (!this.IsDisableReportBtn()) {
            this.isShowTextReasonWindow = true;
        }        
    }

    BackToReasonsWindow() {
        this.isShowTextReasonWindow = false;
    }

    ReportUser() {

    }
}