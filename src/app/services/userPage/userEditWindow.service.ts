import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class UserEditWindowService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/userEditWindow");
    }

    UpdateUserInfo(updateFields: any) {
        let details = { updateFields };

        return super.put('/updateUserInfo', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}