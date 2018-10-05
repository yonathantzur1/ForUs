import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SearchPageService } from '../../services/searchPage/searchPage.service';

@Component({
    selector: 'searchPage',
    templateUrl: './searchPage.html',
    providers: [SearchPageService]
})

export class SearchPage implements OnInit {

    users: Array<any> = [];

    constructor(private router: Router,
        private route: ActivatedRoute,
        private searchPageService: SearchPageService) { }

    ngOnInit() {
        // In case of route params changes.
        this.route.params.subscribe(params => {

            this.searchPageService.GetSearchResults(params["name"]).then(result => {
                if (result) {
                    this.users = result;
                }
            });

        });
    }
}