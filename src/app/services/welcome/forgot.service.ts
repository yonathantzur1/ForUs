import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ForgotUser } from '../../components/welcome/forgot/forgot.component';

@Injectable()
export class ForgotService extends BasicService {
    constructor(public http: HttpClient) {
        super(http, "/api/forgotPassword");
    }

    ForgotPasswordRequest(email: string) {
        let details = { "email": email };

        return super.put('/forgotPasswordRequest', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    ResetPassword(forgotUser: ForgotUser) {
        let details = {
            "email": forgotUser.email,
            "code": forgotUser.code,
            "newPassword": forgotUser.newPassword
        };

        return super.put('/resetPassword', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    ValidateResetPasswordToken(token: string) {
        return super.get('/validateResetPasswordToken?token=' + token)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    ResetPasswordByToken(token: string, newPassword: string) {
        let details = {
            token,
            newPassword
        };

        return super.put('/resetPasswordByToken', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}