import { BasicService } from '../../basic.service';

export class PermissionsCardService extends BasicService {
    prefix = "/api/permissions";

    GetAllPermissions() {
        return super.get(this.prefix + '/getAllPermissions')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetUserPermissions(userId: string) {
        return super.get(this.prefix + '/getUserPermissions?userId=' + userId)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    UpdatePermissions(userId: string, permissions: Array<any>) {
        let data = { userId, permissions }
        return super.put(this.prefix + '/updatePermissions', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}