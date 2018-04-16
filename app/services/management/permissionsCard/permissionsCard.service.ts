import { BasicService } from '../../basic/basic.service';

export class PermissionsCardService extends BasicService {
    prefix = "/api/permissionsCard";

    GetAllPermissions() {
        return super.get(this.prefix + '/getAllPermissions')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    GetUserPermissions(userId: string) {
        return super.get(this.prefix + '/getUserPermissions?userId=' + userId)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    UpdatePermissions(userId: string, permissions: Array<any>) {
        var data = { userId, permissions }
        return super.put(this.prefix + '/updatePermissions', data)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }
}