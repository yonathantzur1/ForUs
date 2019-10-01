import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class UserReportWindowService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/userReportWindow");
    }

    GetAllReportReasons() {
        return super.get('/getAllReportReasons')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    ReportUser(reportedUserId: string, reasonId: string, reasonDetails: string) {
        let data = { reportedUserId, reasonId, reasonDetails };

        return super.post('/reportUser', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}