import { Component, Input, OnInit } from '@angular/core';

import { UserReportWindowService } from '../../../services/userPage/userReportWindow/userReportWindow.service';
import { AlertService, ALERT_TYPE } from '../../../services/alert/alert.service';
import { GlobalService } from '../../../services/global/global.service';

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
    reportText: string = "";
    maxReportTextLength: number = 600;
    isShowTextReasonWindow: boolean = false;
    isShowEmptyFieldAlert: boolean = false;
    isLoading: boolean;

    constructor(private userReportWindowService: UserReportWindowService,
        private alertService: AlertService,
        private globalService: GlobalService) { }

    ngOnInit() {
        this.isLoading = true;
        this.userReportWindowService.GetAllReportReasons().then((result: Array<ReportReason>) => {
            this.isLoading = false;

            if (result) {
                this.reportReasons = result;
                this.InitializeReasonButtons();
            }
            else {
                this.CloseWindow();
                this.alertService.Alert({
                    title: "דיווח משתמש",
                    text: "אופס... אירעה שגיאה בפתיחת חלון הדיווח.",
                    type: ALERT_TYPE.DANGER,
                    showCancelButton: false
                });
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
        if (!this.reportReasons) {
            return true;
        }
        else {
            for (var i = 0; i < this.reportReasons.length; i++) {
                if (this.reportReasons[i].isClicked) {
                    return false;
                }
            }

            return true;
        }
    }

    ShowTextReasonWindow() {
        if (!this.IsDisableReportBtn()) {
            this.isShowTextReasonWindow = true;
        }
    }

    BackToReasonsWindow() {
        this.isShowTextReasonWindow = false;
    }

    HideEmptyFieldAlert() {
        this.isShowEmptyFieldAlert = false;
    }

    GetSelectedReasonId() {
        for (var i = 0; i < this.reportReasons.length; i++) {
            if (this.reportReasons[i].isClicked) {
                return this.reportReasons[i]._id;
            }
        }

        return null;
    }

    ReportUser() {
        // In case the user did not fill the description text.
        if (this.reportText.trim().length == 0) {
            this.isShowEmptyFieldAlert = true;
        }
        else {
            var selectedReasonId = this.GetSelectedReasonId();
            this.userReportWindowService.ReportUser(this.user._id, selectedReasonId, this.reportText).then(result => {
                if (result) {
                    this.CloseWindow();
                    var successMsg = "הדיווח שהזנת נשמר בהצלחה, ויבדק על ידי צוות האתר." + "\n" +
                        "תודה שעזרת לנו לשמור על סביבה בטוחה יותר!";
                    this.alertService.Alert({
                        title: "דיווח משתמש",
                        text: successMsg,
                        type: ALERT_TYPE.SUCCESS,
                        showCancelButton: false
                    });
                }
                else {
                    this.alertService.Alert({
                        title: "דיווח משתמש",
                        text: "אופס... אירעה שגיאה בשמירת הדיווח.",
                        type: ALERT_TYPE.DANGER,
                        showCancelButton: false
                    });
                }
            });
        }
    }
}