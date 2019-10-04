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

        return super.post('/getUserByName', data);
    }

    GetUserFriends(friendsIds: Array<string>) {
        let data = { friendsIds };

        return super.post('/getUserFriends', data);
    }

    EditUser(updateFields: any) {
        let data = { updateFields };

        return super.put('/editUser', data);
    }

    BlockUser(blockObj: any) {
        let data = { blockObj };

        return super.put('/blockUser', data);
    }

    UnblockUser(userId: string) {
        let data = { userId };

        return super.put('/unblockUser', data);
    }

    RemoveFriends(userId: string, friendId: string) {
        return super.delete('/removeFriends?userId=' + userId + "&friendId=" + friendId);
    }

    DeleteUser(userId: string, userFirstName: string, userLastName: string) {
        return super.delete('/deleteUser?userId=' + userId +
            "&userFirstName=" + userFirstName +
            "&userLastName=" + userLastName);
    }
}