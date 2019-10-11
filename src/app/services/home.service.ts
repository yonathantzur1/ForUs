import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class HomeService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/home");
    }
}