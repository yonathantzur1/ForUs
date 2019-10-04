import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { LoginService } from '../welcome/login.service';

import { PERMISSION } from '../../enums/enums';
import { BasicService } from '../basic.service';

@Injectable()
export class PermissionsService extends BasicService {
    userPermissions: Array<string>;

    constructor(public http: HttpClient) {
        super(http, "/api/auth");
        this.userPermissions = [];
    }

    Initialize() {
        super.get('/getUserPermissions').then(result => {
            this.userPermissions = result;
        }).catch(err => {
            this.userPermissions = [];
        });
    }

    DeletePermissions() {
        this.userPermissions = [];
    }

    IsUserHasAdminPermission() {
        return (this.userPermissions.indexOf(PERMISSION.ADMIN) != -1);
    }

    IsUserHasMasterPermission() {
        return (this.userPermissions.indexOf(PERMISSION.MASTER) != -1);
    }

    IsUserHasRootPermission() {
        return (this.IsUserHasAdminPermission() || this.IsUserHasMasterPermission());
    }
}