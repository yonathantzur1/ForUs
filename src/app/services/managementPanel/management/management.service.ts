import { BasicService } from '../../basic/basic.service';

export class ManagementService extends BasicService {
    prefix = "/api/management";

    GetUserByName(searchInput: string) {
        let details = { searchInput };

        return super.post(this.prefix + '/getUserByName', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetUserFriends(friendsIds: Array<string>) {
        let details = { friendsIds };

        return super.post(this.prefix + '/getUserFriends', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    EditUser(updateFields: any) {
        let details = { updateFields };

        return super.put(this.prefix + '/editUser', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    BlockUser(blockObj: any) {
        let details = { blockObj };

        return super.put(this.prefix + '/blockUser', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    UnblockUser(userId: string) {
        let details = { userId };

        return super.put(this.prefix + '/unblockUser', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    RemoveFriends(userId: string, friendId: string) {
        let details = { userId, friendId };

        return super.delete(this.prefix + '/removeFriends?userId=' + userId + "&friendId=" + friendId)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    DeleteUser(userId: string) {
        return super.delete(this.prefix + '/deleteUser?userId=' + userId)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}