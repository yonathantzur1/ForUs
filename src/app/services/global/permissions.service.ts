import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { LoginService } from '../welcome/login.service';

import { PERMISSION } from '../../enums/enums';

@Injectable()
export class PermissionsService extends LoginService {
    userPermissions: Array<string>;

    constructor(public http: HttpClient) {
        super(http);
        this.userPermissions = [];
    }

    async Initialize() {
        this.userPermissions = await super.GetUserPermissions();
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