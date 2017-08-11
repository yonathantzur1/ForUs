import { BasicService } from '../basic/basic.service';

import { User } from '../../components/login/login.component';
import { NewUser } from '../../components/login/login.component';
import { ForgotUser } from '../../components/login/login.component';
``
export class LoginService extends BasicService {
    prefix = "/login";

    Login(user: User) {
        return super.post(this.prefix + '/login', JSON.stringify(user))
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
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

        return super.post(this.prefix + '/register', JSON.stringify(details))
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }

    Forgot(email: string) {
        var details = { "email": email };

        return super.put(this.prefix + '/forgot', JSON.stringify(details))
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }

    ResetPassword(forgotUser: ForgotUser) {
        var details = {
            "email": forgotUser.email,
            "code": forgotUser.code,
            "newPassword": forgotUser.newPassword
        };

        return super.put(this.prefix + '/resetPassword', JSON.stringify(details))
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }
}