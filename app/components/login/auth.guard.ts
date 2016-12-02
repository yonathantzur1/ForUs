import { Injectable, NgModule } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';

import { User } from '../../components/login/login.component';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthService) { }

    canActivate() {
        return this.authService.IsUserOnSession().then((result) => {
            if (result == null) {
                this.router.navigate(['/login']);
                return false;
            }
            else {
                return true;
            }
      });
    }
}