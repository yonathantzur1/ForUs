import { BasicService } from '../basic/basic.service';

import { User } from '../../components/login/login.component';
import { NewUser } from '../../components/login/login.component';

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