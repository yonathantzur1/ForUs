import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
    selector: 'managementPanel',
    templateUrl: './managementPanel.html',
    providers: []
})

export class ManagementPanelComponent {
    constructor(private router: Router) { }

    Route(url: string) {
        this.router.navigateByUrl(url);
    }
}