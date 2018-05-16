import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare var globalVariables: any;
declare var $: any;

@Component({
    selector: 'managementPanel',
    templateUrl: './managementPanel.html',
    providers: []
})

export class ManagementPanelComponent implements OnInit {
    isTouchDevice: boolean = globalVariables.isTouchDevice;

    constructor(private router: Router) { }

    ngOnInit() {
        if (!this.isTouchDevice) {
            $(".panel-btn").addClass("panel-btn-hover");
        }
    }

    Route(url: string) {
        this.router.navigateByUrl(url);
    }
}