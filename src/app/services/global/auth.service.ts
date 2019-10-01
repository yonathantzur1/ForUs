import { BasicService } from '../basic.service';

export class AuthService extends BasicService {
    prefix = "/api/auth";

    IsUserOnSession() {
        return super.get(this.prefix + '/isUserOnSession')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    IsUserRoot() {
        return super.get(this.prefix + '/isUserRoot')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetCurrUser() {
        return super.get(this.prefix + '/getCurrUser')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    SetCurrUserToken() {
        return super.get(this.prefix + '/setCurrUserToken')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    IsUserSocketConnect() {
        return super.get(this.prefix + '/isUserSocketConnect')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}