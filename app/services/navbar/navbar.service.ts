import { BasicService } from '../basic/basic.service';

export class NavbarService extends BasicService {

    prefix = "/api/navbar";

    GetFriends(friendsIds: Array<string>) {
        return super.post(this.prefix + '/getFriends', JSON.stringify(friendsIds))
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    GetMainSearchResults(searchInput: string) {
        var details = { "searchInput": searchInput };

        return super.post(this.prefix + '/getMainSearchResults', JSON.stringify(details))
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    GetMainSearchResultsWithImages(ids: any) {
        var details = { ids };

        return super.post(this.prefix + '/getMainSearchResultsWithImages', JSON.stringify(details))
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    GetUserMessagesNotifications() {
        return super.get(this.prefix + '/getUserMessagesNotifications')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    UpdateMessagesNotifications(messagesNotifications: any, friendId: string) {
        var details = { messagesNotifications };

        super.post(this.prefix + '/updateMessagesNotifications', JSON.stringify(details)).toPromise();
    }

    RemoveMessagesNotifications(messagesNotifications: any) {
        var details = { messagesNotifications };

        super.post(this.prefix + '/removeMessagesNotifications', JSON.stringify(details)).toPromise();
    }

    GetUserFriendRequests() {
        return super.get(this.prefix + '/getUserFriendRequests')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    AddFriendRequest(friendId: string) {
        var details = { friendId };

        return super.post(this.prefix + '/addFriendRequest', JSON.stringify(details))
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    RemoveFriendRequest(friendId: string) {
        var details = { friendId };

        return super.post(this.prefix + '/removeFriendRequest', JSON.stringify(details))
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    IgnoreFriendRequest(friendId: string) {
        var details = { friendId };

        return super.post(this.prefix + '/ignoreFriendRequest', JSON.stringify(details))
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

    AddFriend(friendId: string) {
        var details = { friendId };

        return super.post(this.prefix + '/addFriend', JSON.stringify(details))
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }
}