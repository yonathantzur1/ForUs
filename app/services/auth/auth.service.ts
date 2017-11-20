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

    GetCurrUserToken() {
        return super.get(this.prefix + '/getCurrUserToken')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }
}