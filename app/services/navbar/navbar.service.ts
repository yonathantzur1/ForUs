import { BasicService } from '../basic/basic.service';

export class NavbarService extends BasicService {

    prefix = "/api/navbar";

    GetFriends(friendsIds: Array<string>) {
        return super.post(this.prefix + '/getFriends', JSON.stringify(friendsIds))
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }

    GetMainSearchResults(searchInput: string, searchLimit: number) {
        var details = { "searchInput": searchInput, "searchLimit": searchLimit };

        return super.post(this.prefix + '/getMainSearchResults', JSON.stringify(details))
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }

    GetMainSearchResultsWithImages(ids: any) {
        var details = { ids };

        return super.post(this.prefix + '/getMainSearchResultsWithImages', JSON.stringify(details))
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }

    GetUserMessagesNotifications() {
        return super.get(this.prefix + '/getUserMessagesNotifications')
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }

    UpdateMessagesNotifications(messagesNotifications: any, friendId: string) {
        var details = { messagesNotifications, friendId };

        super.post(this.prefix + '/updateMessagesNotifications', JSON.stringify(details)).toPromise();
    }

    RemoveMessagesNotifications(messagesNotifications: any) {
        var details = { messagesNotifications };

        super.post(this.prefix + '/removeMessagesNotifications', JSON.stringify(details)).toPromise();
    }
}