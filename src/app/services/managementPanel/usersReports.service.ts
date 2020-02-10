import { Injectable } from '@angular/core';

import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UsersReportsService extends BasicService {
    
    constructor(public http: HttpClient) {
        super(http, "/api/usersReports");
    }

    getAllReports() {
        return super.get('/getAllReports');
    }
}