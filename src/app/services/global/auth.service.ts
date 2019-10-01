import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/auth");
    }

    IsUserOnSession() {
        return super.get('/isUserOnSession')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    IsUserRoot() {
        return super.get('/isUserRoot')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetCurrUser() {
        return super.get('/getCurrUser')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    SetCurrUserToken() {
        return super.get('/setCurrUserToken')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    IsUserSocketConnect() {
        return super.get('/isUserSocketConnect')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}