import { BasicService } from '../basic/basic.service';

export class UserEditWindowService extends BasicService {

    prefix = "/api/userEditWindow";

    UpdateUserInfo(updateFields: any) {
        let details = { updateFields };

        return super.put(this.prefix + '/updateUserInfo', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}