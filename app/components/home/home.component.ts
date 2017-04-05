import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { HomeService } from '../../services/home/home.service';

@Component({
    selector: 'home',
    templateUrl: 'views/home.html',
    providers: [HomeService]
})

export class HomeComponent implements OnInit {
    constructor(private router: Router, private authService: AuthService, private homeService: HomeService) { }

    ngOnInit() {
        this.GetCurrUserName();
    }

    currUserName = "";

    GetCurrUserName() {
        this.authService.GetCurrUserName().then((result) => {
            this.currUserName = result._body;
        });
    }
}