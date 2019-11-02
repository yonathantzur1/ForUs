import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { EventService, EVENT_TYPE } from '../../services/global/event.service';

export class DropMenuData {
    link: string;
    text: string;
    action: Function;
    showFunction: Function;

    constructor(link: string, text: string, action?: Function, showFunction?: Function) {
        this.link = link;
        this.text = text;
        this.action = action;
        this.showFunction = showFunction;
    }
}

@Component({
    selector: 'dropMenu',
    templateUrl: './dropMenu.html',
    providers: [],
    styleUrls: ['./dropMenu.css']
})

export class DropMenuComponent {
    constructor(private router: Router, private eventService: EventService) { }

    @Input() options: DropMenuData[];

    Click(action: Function, link: string) {
        action && action(link);
        link && this.router.navigateByUrl(link);

        this.eventService.Emit(EVENT_TYPE.closeDropMenu, true);
        this.eventService.Emit(EVENT_TYPE.openNewWindow, true);
    }
}