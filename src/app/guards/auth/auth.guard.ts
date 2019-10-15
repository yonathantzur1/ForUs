import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { AuthService } from '../../services/global/auth.service';
import { GlobalService } from '../../services/global/global.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router,
        private authService: AuthService,
        private globalService: GlobalService) { }

    canActivate() {
        return this.authService.IsUserOnSession().then(result => {
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