import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class UserPageService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/userPage");
    }

    GetUserDetails(id: string) {
        return super.get('/getUserDetails?id=' + id);
    }

    removeFriends(friendId: string) {
        return super.delete('/removeFriends?friendId=' + friendId);
    }

    DeleteUserValidation() {
        return super.put('/deleteUserValidation');
    }

    deleteUser() {
        return super.delete('/deleteUser');
    }

}