import { BasicService } from '../basic/basic.service';

export class NavbarService extends BasicService {

    prefix = "/api/navbar";

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
        var details = { "ids": ids };

        return super.post(this.prefix + '/getMainSearchResultsWithImages', JSON.stringify(details))
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }
}