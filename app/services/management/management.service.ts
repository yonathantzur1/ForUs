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

    EditUser(updateFields: any) {
        var details = { updateFields };

        return super.put(this.prefix + '/editUser', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    BlockUser(blockObj: any) {
        var details = { blockObj };

        return super.put(this.prefix + '/blockUser', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    UnblockUser(userId: string) {
        var details = { userId };

        return super.put(this.prefix + '/unblockUser', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    RemoveFriends(userId: string, friendId: string) {
        var details = { userId, friendId };

        return super.delete(this.prefix + '/removeFriends?userId=' + userId + "&friendId=" + friendId)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    DeleteUser(userId: string) {
        return super.delete(this.prefix + '/deleteUser?userId=' + userId)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }
}