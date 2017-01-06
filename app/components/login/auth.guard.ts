import { Injectable, NgModule } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';

import { User } from './login.component';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthService) { }

    canActivate() {
        return this.authService.IsUserOnSession().then((result) => {
            if (result == false) {
                this.router.navigateByUrl('/login');
                return false;
            }
            else {
                return true;
            }
        });
    }
}