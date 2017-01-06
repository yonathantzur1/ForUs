import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { DropMenuData } from '../navbar/navbar.component';

@Component({
    selector: 'dropMenu',
    templateUrl: 'views/dropMenu.html',
    providers: []
})

export class DropMenuComponent {
    constructor(private router: Router) { }

    @Input() options: DropMenuData[];

    ActiveAction = function (action: Function, object: any, link: string) {
        if (action) {
            action(object, link);
        }
        else {
            this.router.navigateByUrl(link);
        }
    }
}