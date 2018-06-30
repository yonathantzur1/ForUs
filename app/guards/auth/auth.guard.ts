import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { GlobalService } from '../../services/global/global.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthService, private globalService: GlobalService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.authService.IsUserOnSession().then((result) => {
            if (result) {
                this.globalService.Initialize();
                return true;
            }
            else {
                this.router.navigateByUrl('/login');
                return false;
            }
        });
    }
}