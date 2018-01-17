import { BasicService } from '../basic/basic.service';

export class ManagementService extends BasicService {
    prefix = "/api/management";

    GetUserByName(searchInput: string) {
        var details = { searchInput };

        return super.post(this.prefix + '/getUserByName', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    GetUserFriends(friendsIds: Array<string>) {
        var details = { friendsIds };

        return super.post(this.prefix + '/getUserFriends', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }
}