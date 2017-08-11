import { BasicService } from '../basic/basic.service';

export class AuthService extends BasicService {
    prefix = "/api/auth";

    IsUserOnSession() {
        return super.get(this.prefix + '/isUserOnSession')
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }

    GetCurrUserName() {
        return super.get(this.prefix + '/getCurrUserName')
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }
}