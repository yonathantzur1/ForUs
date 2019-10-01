import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class UsersReportsService extends BasicService {
    
    constructor(public http: HttpClient) {
        super(http, "/api/usersReports");
    }

    GetAllReports() {
        return super.get('/getAllReports')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}