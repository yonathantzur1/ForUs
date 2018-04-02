import { BasicService } from '../../basic/basic.service';

export class FriendRequestsWindowService extends BasicService {

    prefix = "/api/friendRequestsWindow";

    RemoveRequestConfirmAlert(confirmedFriendsIds: Array<string>) {
        var data = { confirmedFriendsIds };

        return super.put(this.prefix + '/removeRequestConfirmAlert', data)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }
}