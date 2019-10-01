import { BasicService } from '../basic.service';

import { User } from '../../components/welcome/login/login.component';

export class LoginService extends BasicService {
    prefix = "/api/login";

    Login(user: User) {
        return super.post(this.prefix + '/userLogin', user)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetUserPermissions() {
        return super.get(this.prefix + '/getUserPermissions')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    DeleteTokenFromCookie() {
        return super.delete(this.prefix + '/deleteToken')
            .then(() => {
                return true;
            })
            .catch(() => {
                return null;
            });
    }
}