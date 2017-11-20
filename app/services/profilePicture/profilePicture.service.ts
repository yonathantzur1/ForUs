import { BasicService } from '../basic/basic.service';

export class ProfilePictureService extends BasicService {

    prefix = "/api/profilePicture";

    GetUserProfileImage() {
        return super.get(this.prefix + '/getUserProfileImage')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

}