import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UsersReportsService } from '../../../services/managementPanel/usersReports.service';
import { SnackbarService } from '../../../services/global/snackbar.service';
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
    providers: [UsersReportsService],
    styleUrls: ['./usersReports.css']
})

export class UsersReportsComponent implements OnInit {
    isLoading: boolean;
    reports: Array<any>;
    userReportStatus = USER_REPORT_STATUS;

    constructor(private router: Router,
        private usersReportsService: UsersReportsService,
        public snackbarService: SnackbarService) { }

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
                    this.calculateReportStatus(report);
                });

                this.reports = reports;
            }
        });
    }

    calculateReportStatus(report: Report) {
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

    getInfoDateString(date: string) {
        let dateObj = new Date(date);

        let dateString = (dateObj.getDate()) + "/" + (dateObj.getMonth() + 1) + "/" + dateObj.getFullYear();

        let HH = dateObj.getHours().toString();
        let mm = dateObj.getMinutes().toString();

        if (mm.length == 1) {
            mm = "0" + mm;
        }

        let timeString = (HH + ":" + mm);

        return (timeString + " - " + dateString);
    }

    moveToUserPage(user: any) {
        if (user) {
            this.router.navigateByUrl("/profile/" + user._id);
        }
    }
}