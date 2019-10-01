import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class UserPageService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/userPage");
    }

    GetUserDetails(id: string) {
        return super.get('/getUserDetails?id=' + id)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    RemoveFriends(friendId: string) {
        return super.delete('/removeFriends?friendId=' + friendId)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    DeleteUserValidation() {
        return super.put('/deleteUserValidation')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    DeleteUser() {
        return super.delete('/deleteUser')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}