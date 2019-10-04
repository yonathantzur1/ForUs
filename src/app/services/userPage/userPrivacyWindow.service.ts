import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class UserPrivacyWindowService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/userPrivacyWindow");
    }

    GetUserPrivacyStatus() {
        return super.get('/getUserPrivacyStatus');
    }

    SetUserPrivacy(isPrivate: boolean) {
        let details = { isPrivate };

        return super.put('/setUserPrivacy', details);
    }

}