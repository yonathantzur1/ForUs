import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ProfilePictureService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/profilePicture");
    }

    GetUserProfileImage() {
        return super.get('/getUserProfileImage')
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

        return super.post('/saveImage', image)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    DeleteImage() {
        return super.delete('/deleteImage')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}