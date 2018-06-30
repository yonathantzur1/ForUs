import { Observable, Subject } from "rxjs";

import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { GlobalService } from '../../services/global/global.service';

declare function getCookie(name: string): string

@Injectable()
export class LoginGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthService, private globalService: GlobalService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return Observable.create((observer: Subject<boolean>) => {
            if (!getCookie(this.globalService.uidCookieName)) {
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