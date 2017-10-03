import { Injectable, NgModule } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';

import { User } from './login.component';

declare var setToken: any;

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthService) { }

    canActivate() {
        return this.authService.IsUserOnSession().then((result) => {
            if (result) {
                setToken(result.token);
                return true;
            }
            else {
                this.router.navigateByUrl('/login');
                return false;
            }
        });
    }
}