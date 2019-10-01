import { BasicService } from './basic.service';

export class NavbarService extends BasicService {

    prefix = "/api/navbar";

    GetFriends(friendsIds: Array<string>) {
        return super.post(this.prefix + '/getFriends', friendsIds)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetMainSearchResults(searchInput: string) {
        let details = { searchInput };

        return super.post(this.prefix + '/getMainSearchResults', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetMainSearchResultsWithImages(ids: any) {
        return super.post(this.prefix + '/getMainSearchResultsWithImages', ids)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetUserMessagesNotifications() {
        return super.get(this.prefix + '/getUserMessagesNotifications')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    UpdateMessagesNotifications(messagesNotifications: any) {
        let details = { messagesNotifications };

        super.post(this.prefix + '/updateMessagesNotifications', details);
    }

    RemoveMessagesNotifications(messagesNotifications: any) {
        let details = { messagesNotifications };

        super.post(this.prefix + '/removeMessagesNotifications', details);
    }

    GetUserFriendRequests() {
        return super.get(this.prefix + '/getUserFriendRequests')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    AddFriendRequest(friendId: string) {
        let details = { friendId };

        return super.post(this.prefix + '/addFriendRequest', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    RemoveFriendRequest(friendId: string) {
        let details = { friendId };

        return super.post(this.prefix + '/removeFriendRequest', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    IgnoreFriendRequest(friendId: string) {
        let details = { friendId };

        return super.post(this.prefix + '/ignoreFriendRequest', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    AddFriend(friendId: string) {
        let details = { friendId };

        return super.post(this.prefix + '/addFriend', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    RemoveFriendRequestConfirmAlert(confirmedFriendsIds: Array<string>) {
        let data = { confirmedFriendsIds };

        return super.put(this.prefix + '/removeFriendRequestConfirmAlert', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}