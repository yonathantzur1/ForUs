import { BasicService } from '../basic.service';

export class UserPageService extends BasicService {

    prefix = "/api/userPage";

    GetUserDetails(id: string) {
        return super.get(this.prefix + '/getUserDetails?id=' + id)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    RemoveFriends(friendId: string) {
        return super.delete(this.prefix + '/removeFriends?friendId=' + friendId)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    DeleteUserValidation() {
        return super.put(this.prefix + '/deleteUserValidation')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    DeleteUser() {
        return super.delete(this.prefix + '/deleteUser')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}