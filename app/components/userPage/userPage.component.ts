import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AlertService } from '../../services/alert/alert.service';

@Component({
    selector: 'userPage',
    templateUrl: './userPage.html',
    providers: []
})

export class UserPageComponent implements OnInit {
    constructor(private alertService: AlertService,
        private route: ActivatedRoute) { }

    ngOnInit() {
        var id = this.route.snapshot.params.id;
    }
}