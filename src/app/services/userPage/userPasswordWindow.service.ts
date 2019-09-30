import { BasicService } from '../basic.service';

import { Password } from '../../components/userPage/userPasswordWindow/userPasswordWindow.component';

export class UserPasswordWindowService extends BasicService {

    prefix = "/api/userPasswordWindow";

    UpdateUserPassword(password: Password) {
        return super.put(this.prefix + '/updateUserPassword', password)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    ChangePasswordByMail() {
        return super.get(this.prefix + '/changePasswordByMail')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}