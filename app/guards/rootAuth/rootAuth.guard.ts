import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class RootAuthGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.authService.IsUserRoot().then((result) => {
            if (result) {
                return true;
            }
            else {
                this.router.navigateByUrl('/page-not-found');
                return false;
            }
        });
    }
}