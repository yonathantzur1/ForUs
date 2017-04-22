import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProfileService {
    private headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http) { }

    SaveImage(imgBase64: string) {
        var image = {
            "imgBase64": imgBase64
        };

        return this.http.post('/saveImage', JSON.stringify(image), { headers: this.headers })
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }

    DeleteImage() {
        return this.http.delete('/deleteImage')
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }
}