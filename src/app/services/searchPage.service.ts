import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class SearchPageService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/searchPage");
    }

    GetSearchResults(input: string) {
        return super.get('/getSearchResults?input=' + input)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetUserFriendsStatus() {
        return super.get('/getUserFriendsStatus')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}