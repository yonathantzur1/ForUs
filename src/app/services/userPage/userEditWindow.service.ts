import { Injectable } from '@angular/core';

import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserEditWindowService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/userEditWindow");
    }

    updateUserInfo(updateFields: any) {
        let details = { updateFields };

        return super.put('/updateUserInfo', details);
    }
}