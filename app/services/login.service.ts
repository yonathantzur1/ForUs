import { Injectable } from '@angular/core';
import {Headers, Http} from '@angular/http';

import 'rxjs/add/operator/toPromise';

declare var sha512;

@Injectable()
export class LoginService {
    private headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http) {}

    Login(email: string, password: string) {
        return this.http.get('/login' + "/" + email + "/" + sha512(password))
        .toPromise()
        .then((result) => {
            return result.json();
        })
        .catch((result) => {
            return null;
        });
    }

    Register(name: string, email: string, password: string) {
        var details = JSON.stringify({"name": name, "email": email, "password": sha512(password)});
        return this.http.post('/Register', details, {headers: this.headers})
        .toPromise()
        .then((result) => {
            return result.json();
        })
        .catch((result) => {
            return null;
        });
    }
}