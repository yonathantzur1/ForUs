import { BasicService } from '../../basic.service';

export class ManagementService extends BasicService {
    prefix = "/api/management";

    GetUserByName(searchInput: string) {
        let data = { searchInput };

        return super.post(this.prefix + '/getUserByName', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetUserFriends(friendsIds: Array<string>) {
        let data = { friendsIds };

        return super.post(this.prefix + '/getUserFriends', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    EditUser(updateFields: any) {
        let data = { updateFields };

        return super.put(this.prefix + '/editUser', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    BlockUser(blockObj: any) {
        let data = { blockObj };

        return super.put(this.prefix + '/blockUser', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    UnblockUser(userId: string) {
        let data = { userId };

        return super.put(this.prefix + '/unblockUser', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    RemoveFriends(userId: string, friendId: string) {
        return super.delete(this.prefix + '/removeFriends?userId=' + userId + "&friendId=" + friendId)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    DeleteUser(userId: string, userFirstName: string, userLastName: string) {
        return super.delete(this.prefix + '/deleteUser?userId=' + userId +
            "&userFirstName=" + userFirstName +
            "&userLastName=" + userLastName)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}