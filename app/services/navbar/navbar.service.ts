import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class NavbarService {
    private headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http) { }

    GetMainSearchResults(searchInput: string, searchLimit: number) {
        var details = { "searchInput": searchInput, "searchLimit": searchLimit };

        return this.http.post('/getMainSearchResults', JSON.stringify(details), { headers: this.headers })
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

        return this.http.post('/getMainSearchResultsWithImages', JSON.stringify(details), { headers: this.headers })
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }
}