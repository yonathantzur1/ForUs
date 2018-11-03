import { Observable, Subject } from "rxjs";

import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { CookieService } from '../../services/cookie/cookie.service';
import { GlobalService } from '../../services/global/global.service';

@Injectable()
export class LoginGuard implements CanActivate {
    constructor(private router: Router,
        private authService: AuthService,
        private cookieService: CookieService,
        private globalService: GlobalService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return Observable.create((observer: Subject<boolean>) => {
            if (!this.cookieService.GetCookie(this.globalService.uidCookieName)) {
                observer.next(true);
            }
            else {
                this.authService.IsUserOnSession().then((result) => {
                    if (!result) {
                        observer.next(true);
                    }
                    else {
                        this.router.navigateByUrl('/');
                        observer.next(false);
                    }
                });
            }
        });
    }
}