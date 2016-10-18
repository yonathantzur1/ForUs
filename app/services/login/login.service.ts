import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { User } from '../../components/login/login.component';
import { NewUser } from '../../components/login/login.component';
import { ForgotUser } from '../../components/login/login.component';

declare var sha512;

@Injectable()
export class LoginService {
    private headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http) { }

    Login(user: User) {
        return this.http.get('/login' + "/" + user.email + "/" + sha512(user.password))
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }

    Register(newUser: NewUser) {
        var details = {
            "name": newUser.name,
            "email": newUser.email,
            "password": sha512(newUser.password)
        };

        return this.http.post('/register', JSON.stringify(details), { headers: this.headers })
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }

    Forgot(email: string) {
        var details = JSON.stringify({ "email": email });
        return this.http.put('/forgot', details, { headers: this.headers })
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }

    ResetPassword(forgotUser: ForgotUser) {
        var details = {
            "email": forgotUser.email,
            "code": forgotUser.code,
            "newPassword": sha512(forgotUser.newPassword)
        };

        return this.http.put('/resetPassword', JSON.stringify(details), { headers: this.headers })
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }
}