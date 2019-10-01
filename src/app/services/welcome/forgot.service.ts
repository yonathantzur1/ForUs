import { BasicService } from '../basic.service';

import { ForgotUser } from '../../components/welcome/forgot/forgot.component';

export class ForgotService extends BasicService {
    prefix = "/api/forgotPassword";

    ForgotPasswordRequest(email: string) {
        let details = { "email": email };

        return super.put(this.prefix + '/forgotPasswordRequest', details)
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

        return super.put(this.prefix + '/resetPassword', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    ValidateResetPasswordToken(token: string) {
        return super.get(this.prefix + '/validateResetPasswordToken?token=' + token)
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

        return super.put(this.prefix + '/resetPasswordByToken', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}