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
    currUserName = { firstName: "", lastName: "" };

    ngOnInit() {
        this.GetCurrUserName();
    }

    GetCurrUserName() {
        this.authService.GetCurrUserName().then((result) => {
            this.currUserName = result;
        });
    }
}