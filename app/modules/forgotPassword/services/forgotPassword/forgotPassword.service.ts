import { BasicService } from '../../../../services/basic/basic.service';

export class ForgotPasswordService extends BasicService {
    prefix = "/forgotPassword";

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