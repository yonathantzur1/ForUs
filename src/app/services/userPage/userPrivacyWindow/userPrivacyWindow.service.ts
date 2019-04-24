import { BasicService } from '../../basic/basic.service';

export class UserPrivacyWindowService extends BasicService {

    prefix = "/api/userPrivacyWindow";

    GetUserPrivacyStatus() {
        return super.get(this.prefix + '/getUserPrivacyStatus')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    SetUserPrivacy(isPrivate: boolean) {
        var details = { isPrivate };

        return super.put(this.prefix + '/setUserPrivacy', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}