import { Component, Input, OnInit } from '@angular/core';

import { SearchPageService } from '../../services/searchPage/searchPage.service';

class ReportReason {
    _id: string;
    name: string;
    isClicked: boolean;
}

@Component({
    selector: 'searchPage',
    templateUrl: './searchPage.html',
    providers: [SearchPageService]
})

export class SearchPage implements OnInit {

    constructor() { }

    ngOnInit() {

    }
}