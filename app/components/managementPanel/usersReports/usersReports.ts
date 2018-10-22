import { Component, OnInit } from '@angular/core';

import { UsersReportsService } from '../../../services/managementPanel/usersReports/usersReports.service';

@Component({
    selector: 'usersReports',
    templateUrl: './usersReports.html',
    providers: [UsersReportsService]
})

export class UsersReportsComponent implements OnInit {
    reports: Array<any>;

    constructor(private usersReportsService: UsersReportsService) { }

    ngOnInit() {
        this.usersReportsService.GetAllReports().then(result => {
            this.reports = result;
        });
    }
}