import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class NavbarService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/navbar");
    }

    GetFriends(friendsIds: Array<string>) {
        return super.post('/getFriends', friendsIds);
    }

    GetMainSearchResults(searchInput: string) {
        let details = { searchInput };

        return super.post('/getMainSearchResults', details);
    }

    GetMainSearchResultsWithImages(ids: any) {
        return super.post('/getMainSearchResultsWithImages', ids);
    }

    GetUserMessagesNotifications() {
        return super.get('/getUserMessagesNotifications');
    }

    UpdateMessagesNotifications(messagesNotifications: any) {
        let details = { messagesNotifications };

        super.post('/updateMessagesNotifications', details);
    }

    RemoveMessagesNotifications(messagesNotifications: any) {
        let details = { messagesNotifications };

        super.post('/removeMessagesNotifications', details);
    }

    GetUserFriendRequests() {
        return super.get('/getUserFriendRequests');
    }

    AddFriendRequest(friendId: string) {
        let details = { friendId };

        return super.post('/addFriendRequest', details);
    }

    RemoveFriendRequest(friendId: string) {
        let details = { friendId };

        return super.post('/removeFriendRequest', details);
    }

    IgnoreFriendRequest(friendId: string) {
        let details = { friendId };

        return super.post('/ignoreFriendRequest', details);
    }

    AddFriend(friendId: string) {
        let details = { friendId };

        return super.post('/addFriend', details);
    }

    RemoveFriendRequestConfirmAlert(confirmedFriendsIds: Array<string>) {
        let data = { confirmedFriendsIds };

        return super.put('/removeFriendRequestConfirmAlert', data);
    }
}