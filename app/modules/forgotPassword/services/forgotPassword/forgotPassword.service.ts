import { BasicService } from '../../../../services/basic/basic.service';

import { ForgotUser } from '../../../../components/login/login.component';

export class ForgotPasswordService extends BasicService {
    prefix = "/forgotPassword";

    Forgot(email: string) {
        var details = { "email": email };

        return super.put(this.prefix + '/forgot', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    ResetPassword(forgotUser: ForgotUser) {
        var details = {
            "email": forgotUser.email,
            "code": forgotUser.code,
            "newPassword": forgotUser.newPassword
        };

        return super.put(this.prefix + '/resetPassword', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    ValidateResetPasswordToken(token: string) {
        return super.get(this.prefix + '/validateResetPasswordToken?token=' + token)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    ResetPasswordByToken(token: string, newPassword: string) {
        var details = {
            "token": token,
            "newPassword": newPassword
        };

        return super.put(this.prefix + '/resetPasswordByToken', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}