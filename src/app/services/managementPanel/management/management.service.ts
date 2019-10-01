import { BasicService } from '../../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ManagementService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/management");
    }

    GetUserByName(searchInput: string) {
        let data = { searchInput };

        return super.post('/getUserByName', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetUserFriends(friendsIds: Array<string>) {
        let data = { friendsIds };

        return super.post('/getUserFriends', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    EditUser(updateFields: any) {
        let data = { updateFields };

        return super.put('/editUser', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    BlockUser(blockObj: any) {
        let data = { blockObj };

        return super.put('/blockUser', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    UnblockUser(userId: string) {
        let data = { userId };

        return super.put('/unblockUser', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    RemoveFriends(userId: string, friendId: string) {
        return super.delete('/removeFriends?userId=' + userId + "&friendId=" + friendId)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    DeleteUser(userId: string, userFirstName: string, userLastName: string) {
        return super.delete('/deleteUser?userId=' + userId +
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