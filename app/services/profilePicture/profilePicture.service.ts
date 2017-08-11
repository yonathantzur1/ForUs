import { BasicService } from '../basic/basic.service';

export class ProfilePictureService extends BasicService {

    prefix = "/api/profilePicture";

    GetUserProfileImage() {
        return super.get(this.prefix + '/getUserProfileImage')
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }

}