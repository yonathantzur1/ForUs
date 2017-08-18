import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { HomeService } from '../../services/home/home.service';

@Component({
    selector: 'home',
    templateUrl: './home.html',
    providers: [HomeService]
})

export class HomeComponent implements OnInit {
    constructor(private router: Router, private authService: AuthService, private homeService: HomeService) { }

    isOpenEditWindow = false;
    currUser: any = null;

    ngOnInit() {
        this.GetCurrUser();
    }

    GetCurrUser() {
        this.authService.GetCurrUser().then((result) => {
            this.currUser = result;
        });
    }
}