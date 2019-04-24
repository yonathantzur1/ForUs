import { BasicService } from '../../../../services/basic/basic.service';

export class DeleteUserService extends BasicService {
    prefix = "/api/deleteUser";

    ValidateDeleteUserToken(token: string) {
        return super.get(this.prefix + '/validateDeleteUserToken?token=' + token)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    DeleteAccount(token: string, password: string) {
        var details = {
            token,
            password
        };

        return super.put(this.prefix + '/deleteAccount', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}