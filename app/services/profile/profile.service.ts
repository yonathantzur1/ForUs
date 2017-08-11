import { BasicService } from '../basic/basic.service';

export class ProfileService extends BasicService {

    prefix = "/api/profile";

    SaveImage(imgBase64: string) {
        var image = {
            "imgBase64": imgBase64
        };

        return super.post(this.prefix + '/saveImage', JSON.stringify(image))
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }

    DeleteImage() {
        return super.delete(this.prefix + '/deleteImage')
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }
}