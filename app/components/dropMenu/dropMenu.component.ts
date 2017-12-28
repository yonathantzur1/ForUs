import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { DropMenuData } from '../navbar/navbar.component';

@Component({
    selector: 'dropMenu',
    templateUrl: './dropMenu.html',
    providers: []
})

export class DropMenuComponent {
    constructor(private router: Router, private globalService: GlobalService) { }
    
    @Input() options: DropMenuData[];

    ActiveAction(action: Function, link: string) {

        if (action) {
            action(link);
        }
        else {
            this.router.navigateByUrl(link);
        }

        this.globalService.setData("closeDropMenu", true);
        this.globalService.setData("openNewWindow", true);
    }
}