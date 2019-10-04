import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Password } from '../../components/userPage/userPasswordWindow/userPasswordWindow.component';

@Injectable()
export class UserPasswordWindowService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/userPasswordWindow");
    }

    UpdateUserPassword(password: Password) {
        return super.put('/updateUserPassword', password);
    }

    ChangePasswordByMail() {
        return super.get('/changePasswordByMail');
    }
}