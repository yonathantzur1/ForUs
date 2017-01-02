import { Component, Input } from '@angular/core';

import { DropMenuData } from '../navbar/navbar.component';

@Component({
    selector: 'dropMenu',
    templateUrl: 'views/dropMenu.html',
    providers: []
})

export class DropMenuComponent { 
    @Input() options: DropMenuData[];
}