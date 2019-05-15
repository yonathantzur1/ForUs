import { BasicService } from '../basic/basic.service';

export class ProfilePictureService extends BasicService {

    prefix = "/api/profilePicture";

    GetUserProfileImage() {
        return super.get(this.prefix + '/getUserProfileImage')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    SaveImage(imgBase64: string) {
        let image = {
            "imgBase64": imgBase64
        };

        return super.post(this.prefix + '/saveImage', image)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    DeleteImage() {
        return super.delete(this.prefix + '/deleteImage')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}