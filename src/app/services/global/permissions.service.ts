import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { AuthService } from '../global/auth.service';

import { PERMISSION } from '../../enums/enums';

@Injectable()
export class PermissionsService extends AuthService {
    userPermissions: Array<string>;

    constructor(public http: HttpClient) {
        super(http);
        this.userPermissions = [];
    }

    async Initialize() {
        this.userPermissions = (await super.GetUserPermissions()) || [];
    }

    DeletePermissions() {
        this.userPermissions = [];
    }

    IsUserHasAdminPermission() {
        return this.userPermissions.includes(PERMISSION.ADMIN);
    }

    IsUserHasMasterPermission() {
        return this.userPermissions.includes(PERMISSION.MASTER);
    }

    IsUserHasRootPermission() {
        return (this.IsUserHasAdminPermission() || this.IsUserHasMasterPermission());
    }
}