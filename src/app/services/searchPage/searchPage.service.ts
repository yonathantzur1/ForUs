import { BasicService } from '../basic/basic.service';

export class SearchPageService extends BasicService {

    prefix = "/api/searchPage";

    GetSearchResults(input: string) {
        return super.get(this.prefix + '/getSearchResults?input=' + input)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetUserFriendsStatus() {
        return super.get(this.prefix + '/getUserFriendsStatus')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}