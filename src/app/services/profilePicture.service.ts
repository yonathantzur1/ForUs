import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ProfilePictureService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/profilePicture");
    }

    GetUserProfileImage() {
        return super.get('/getUserProfileImage');
    }

    SaveImage(imgBase64: string) {
        let image = {
            "imgBase64": imgBase64
        };

        return super.post('/saveImage', image);
    }

    DeleteImage() {
        return super.delete('/deleteImage');
    }

}