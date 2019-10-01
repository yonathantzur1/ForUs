import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class NavbarService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/navbar");
    }

    GetFriends(friendsIds: Array<string>) {
        return super.post('/getFriends', friendsIds)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetMainSearchResults(searchInput: string) {
        let details = { searchInput };

        return super.post('/getMainSearchResults', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetMainSearchResultsWithImages(ids: any) {
        return super.post('/getMainSearchResultsWithImages', ids)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetUserMessagesNotifications() {
        return super.get('/getUserMessagesNotifications')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
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
        return super.get('/getUserFriendRequests')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    AddFriendRequest(friendId: string) {
        let details = { friendId };

        return super.post('/addFriendRequest', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    RemoveFriendRequest(friendId: string) {
        let details = { friendId };

        return super.post('/removeFriendRequest', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    IgnoreFriendRequest(friendId: string) {
        let details = { friendId };

        return super.post('/ignoreFriendRequest', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    AddFriend(friendId: string) {
        let details = { friendId };

        return super.post('/addFriend', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    RemoveFriendRequestConfirmAlert(confirmedFriendsIds: Array<string>) {
        let data = { confirmedFriendsIds };

        return super.put('/removeFriendRequestConfirmAlert', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}