import { Component, OnDestroy } from '@angular/core';

import { GlobalService } from '../../../services/global/global.service';
import { AlertService } from '../../../services/alert/alert.service';

declare var $: any;

@Component({
    selector: 'permissionsCard',
    templateUrl: './permissionsCard.html',
    providers: []
})

export class PermissionsCardComponent implements OnDestroy {

    subscribeObj: any;

    constructor(private globalService: GlobalService) {
        this.subscribeObj = this.globalService.data.subscribe((value: any) => {
            if (value["isOpenPermissionsCard"]) {
                $("#permissions-modal").modal('show');
            }
        });
    }

    ngOnDestroy() {
        this.subscribeObj.unsubscribe();
    }
}