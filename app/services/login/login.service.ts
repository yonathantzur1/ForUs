import { BasicService } from '../basic/basic.service';

import { User } from '../../components/login/login.component';
import { NewUser } from '../../components/login/login.component';
import { ForgotUser } from '../../components/login/login.component';

export class LoginService extends BasicService {
    prefix = "/login";

    Login(user: User) {
        return super.post(this.prefix + '/userLogin', user)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    UpdateLastLogin() {
        super.post(this.prefix + '/updateLastLogin', null).toPromise();
    }

    GetUserPermissions() {
        return super.get(this.prefix + '/getUserPermissions')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    Register(newUser: NewUser) {
        var details = {
            "firstName": newUser.firstName,
            "lastName": newUser.lastName,
            "email": newUser.email,
            "password": newUser.password
        };

        return super.post(this.prefix + '/register', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    ForgotPasswordRequest(email: string) {
        var details = { "email": email };

        return super.put(this.prefix + '/forgotPasswordRequest', details)
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

    DeleteTokenFromCookie() {
        return super.delete(this.prefix + '/deleteToken')
            .toPromise()
            .then(() => {
                return true;
            })
            .catch(() => {
                return null;
            });
    }
}