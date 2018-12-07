import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UsersReportsService } from '../../../services/managementPanel/usersReports/usersReports.service';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';
import { USER_REPORT_STATUS } from '../../../enums/enums';

class Report {
    _id: string;
    reportingUserId: string;
    reportedUserId: string;
    reasonId: string;
    details: string;
    handledManagerId: string;
    openDate: Date;
    closeDate: Date;
    status: USER_REPORT_STATUS;
}

@Component({
    selector: 'usersReports',
    templateUrl: './usersReports.html',
    providers: [UsersReportsService]
})

export class UsersReportsComponent implements OnInit {
    isLoading: boolean;
    reports: Array<any>;
    userReportStatus = USER_REPORT_STATUS;

    constructor(private router: Router,
        private usersReportsService: UsersReportsService,
        private snackbarService: SnackbarService) { }

    ngOnInit() {
        this.isLoading = true;
        this.usersReportsService.GetAllReports().then((reports: Array<Report>) => {
            this.isLoading = false;

            // In case of error.
            if (!reports) {
                this.snackbarService.Snackbar("שגיאה בטעינת דיווחי משתמשים");
            }
            else {
                reports.forEach((report: Report) => {
                    this.CalculateReportStatus(report);
                });

                this.reports = reports;
            }
        });
    }

    CalculateReportStatus(report: Report) {
        // In case the report was closed.
        if (report.closeDate) {
            report.status = USER_REPORT_STATUS.CLOSE;
        }
        // In case the report was taken by manager.
        else if (report.handledManagerId) {
            report.status = USER_REPORT_STATUS.TAKEN;
        }
        else {
            report.status = USER_REPORT_STATUS.ACTIVE;
        }
    }

    GetInfoDateString(date: string) {
        var dateObj = new Date(date);

        var dateString = (dateObj.getDate()) + "/" + (dateObj.getMonth() + 1) + "/" + dateObj.getFullYear();

        var HH = dateObj.getHours().toString();
        var mm = dateObj.getMinutes().toString();

        if (mm.length == 1) {
            mm = "0" + mm;
        }

        var timeString = (HH + ":" + mm);

        return (timeString + " - " + dateString);
    }

    MoveToUserPage(user: any) {
        if (user) {
            this.router.navigateByUrl("/profile/" + user._id);
        }
    }
}