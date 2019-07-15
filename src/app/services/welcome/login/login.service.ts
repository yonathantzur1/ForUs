import { BasicService } from '../../basic/basic.service';

import { User, NewUser, ForgotUser } from '../../../components/welcome/login/login.component';

export class LoginService extends BasicService {
    prefix = "/api/login";

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
        super.post(this.prefix + '/updateLastLogin').toPromise();
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
        let details = {
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
        let details = { "email": email };

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
        let details = {
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