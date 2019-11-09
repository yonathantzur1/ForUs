import { Component, Input, OnInit, HostListener } from '@angular/core';

import { UserReportWindowService } from '../../../services/userPage/userReportWindow.service';
import { AlertService, ALERT_TYPE } from '../../../services/global/alert.service';
import { EventService, EVENT_TYPE } from '../../../services/global/event.service';

class ReportReason {
    _id: string;
    name: string;
    isClicked: boolean;
}

@Component({
    selector: 'userReportWindow',
    templateUrl: './userReportWindow.html',
    providers: [UserReportWindowService],
    styleUrls: ['./userReportWindow.css', '../userWindow.css']
})

export class UserReportWindowComponent implements OnInit {
    @Input() user: any;
    reportReasons: Array<ReportReason>;
    reportText: string = '';
    maxReportTextLength: number = 600;
    isShowTextReasonWindow: boolean = false;
    isShowEmptyFieldAlert: boolean = false;
    isLoading: boolean;

    constructor(private userReportWindowService: UserReportWindowService,
        public alertService: AlertService,
        private eventService: EventService) { }

    ngOnInit() {
        this.isLoading = true;
        this.userReportWindowService.getAllReportReasons().then((result: Array<ReportReason>) => {
            this.isLoading = false;

            if (result) {
                this.reportReasons = result;
                this.initializeReasonButtons();
            }
            else {
                this.closeWindow();
                this.alertService.alert({
                    title: "דיווח משתמש",
                    text: "אופס... אירעה שגיאה בפתיחת חלון הדיווח.",
                    type: ALERT_TYPE.DANGER,
                    showCancelButton: false
                });
            }
        });
    }

    closeWindow() {
        this.eventService.emit(EVENT_TYPE.closeUserReportWindow);
    }

    initializeReasonButtons() {
        this.reportReasons.forEach((reason) => {
            reason.isClicked = false;
        });
    }

    clickReasonButton(btn: ReportReason) {
        // Disable selected btn in case it is already clicked.
        if (btn.isClicked) {
            btn.isClicked = false;
        }
        else {
            this.initializeReasonButtons();
            btn.isClicked = true;
        }
    }

    isDisableReportBtn() {
        if (!this.reportReasons) {
            return true;
        }
        else {
            for (let i = 0; i < this.reportReasons.length; i++) {
                if (this.reportReasons[i].isClicked) {
                    return false;
                }
            }

            return true;
        }
    }

    showTextReasonWindow() {
        if (!this.isDisableReportBtn()) {
            this.isShowTextReasonWindow = true;
        }
    }

    backToReasonsWindow() {
        this.isShowTextReasonWindow = false;
    }

    hideEmptyFieldAlert() {
        this.isShowEmptyFieldAlert = false;
    }

    getSelectedReasonId() {
        for (let i = 0; i < this.reportReasons.length; i++) {
            if (this.reportReasons[i].isClicked) {
                return this.reportReasons[i]._id;
            }
        }

        return null;
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        // In case of pressing escape.
        if (event.code == "Escape") {
            this.closeWindow();
        }
        else if (event.code == "Enter" || event.code == "NumpadEnter") {
            if (!this.isShowTextReasonWindow) {
                this.showTextReasonWindow();
            }
        }
    }

    reportUser() {
        // In case the user did not fill the description text.
        if (this.reportText.trim().length == 0) {
            this.isShowEmptyFieldAlert = true;
        }
        else {
            let selectedReasonId = this.getSelectedReasonId();
            this.userReportWindowService.reportUser(this.user._id, selectedReasonId, this.reportText).then(result => {
                if (result) {
                    this.closeWindow();
                    let successMsg = "הדיווח שהזנת נשמר בהצלחה, ויבדק על ידי צוות האתר." +
                        "\n" + "תודה שעזרת לשמור על סביבה בטוחה יותר!";
                    this.alertService.alert({
                        title: "דיווח משתמש",
                        text: successMsg,
                        type: ALERT_TYPE.INFO,
                        showCancelButton: false
                    });
                }
                else {
                    this.alertService.alert({
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