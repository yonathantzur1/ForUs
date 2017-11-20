import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class BasicService {

    constructor(public http: HttpClient) { }

    get(url: string) {
        return this.http.get(url);
    }

    post(url: string, data: any) {
        return this.http.post(url, data, this.getRequestOptions());
    }

    put(url: string, data: any) {
        return this.http.put(url, data, this.getRequestOptions());
    }

    delete(url: string) {
        return this.http.delete(url);
    }

    getRequestOptions(): any {
        var headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return { 'headers': headers };
    }

}