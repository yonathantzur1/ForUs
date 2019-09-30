import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { EventService } from '../../services/global/event/event.service';
import { DropMenuData } from '../navbar/navbar.component';

@Component({
    selector: 'dropMenu',
    templateUrl: './dropMenu.html',
    providers: [],
    styleUrls: ['./dropMenu.css']
})

export class DropMenuComponent {
    constructor(private router: Router, private eventService: EventService) { }

    @Input() options: DropMenuData[];

    ActiveAction(action: Function, link: string) {

        if (action) {
            action(link);
        }
        else {
            link && this.router.navigateByUrl(link);
        }

        this.eventService.Emit("closeDropMenu", true);
        this.eventService.Emit("openNewWindow", true);
    }
}