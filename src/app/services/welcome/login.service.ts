import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { User } from '../../components/welcome/login/login.component';

@Injectable()
export class LoginService extends BasicService {
    
    constructor(public http: HttpClient) {
        super(http, "/api/login");
    }

    Login(user: User) {
        return super.post('/userLogin', user)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetUserPermissions() {
        return super.get('/getUserPermissions')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    DeleteTokenFromCookie() {
        return super.delete('/deleteToken')
            .then(() => {
                return true;
            })
            .catch(() => {
                return null;
            });
    }
}