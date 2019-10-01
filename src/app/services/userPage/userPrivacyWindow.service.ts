import { BasicService } from '../basic.service';

export class UserPrivacyWindowService extends BasicService {

    prefix = "/api/userPrivacyWindow";

    GetUserPrivacyStatus() {
        return super.get(this.prefix + '/getUserPrivacyStatus')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    SetUserPrivacy(isPrivate: boolean) {
        let details = { isPrivate };

        return super.put(this.prefix + '/setUserPrivacy', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}