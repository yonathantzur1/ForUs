import { BasicService } from '../../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class PermissionsCardService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/permissions");
    }

    GetAllPermissions() {
        return super.get('/getAllPermissions')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetUserPermissions(userId: string) {
        return super.get('/getUserPermissions?userId=' + userId)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    UpdatePermissions(userId: string, permissions: Array<any>) {
        let data = { userId, permissions }
        return super.put('/updatePermissions', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}