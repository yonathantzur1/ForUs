import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { UserPageService } from '../../services/userPage/userPage.service';

@Component({
    selector: 'userPage',
    templateUrl: './userPage.html',
    providers: [UserPageService]
})

export class UserPageComponent implements OnInit {
    userId: string;
    isLoading: boolean;
    user: any;

    constructor(private route: ActivatedRoute,
        private userPageService: UserPageService,
        private globalService: GlobalService) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.userId = params["id"];

            this.userPageService.GetUserDetails(this.userId).then((user: any) => {
                user && this.InitializePage(user);
            });
        });
    }

    InitializePage(user: any) {
        this.globalService.setData("changeSearchInput", user.firstName + " " + user.lastName);
        this.user = user;
    }
}