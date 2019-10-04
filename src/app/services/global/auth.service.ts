import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/auth");
    }

    IsUserOnSession() {
        return super.get('/isUserOnSession');
    }

    IsUserRoot() {
        return super.get('/isUserRoot');
    }

    GetCurrUser() {
        return super.get('/getCurrUser');
    }

    SetCurrUserToken() {
        return super.get('/setCurrUserToken');
    }

    IsUserSocketConnect() {
        return super.get('/isUserSocketConnect');
    }

    GetUserPermissions() {
        return super.get('/getUserPermissions');
    }
}