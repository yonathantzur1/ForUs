import { BasicService } from '../basic/basic.service';

export class AuthService extends BasicService {
    prefix = "/api/auth";

    IsUserOnSession() {
        return super.get(this.prefix + '/isUserOnSession')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    GetCurrUser() {
        return super.get(this.prefix + '/getCurrUser')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    SetCurrUserToken() {
        return super.get(this.prefix + '/setCurrUserToken')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
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
                return false;
            });
    }
}