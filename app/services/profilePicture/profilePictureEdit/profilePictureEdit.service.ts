import { BasicService } from '../../basic/basic.service';

export class ProfilePictureEditService extends BasicService {

    prefix = "/api/profile";

    SaveImage(imgBase64: string) {
        var image = {
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