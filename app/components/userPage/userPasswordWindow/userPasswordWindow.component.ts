import { Component, Input } from '@angular/core';

import { GlobalService } from '../../../services/global/global.service';

@Component({
    selector: 'userPasswordWindow',
    templateUrl: './userPasswordWindow.html',
    providers: []
})

export class UserPasswordWindowComponent {
    @Input() userId: string;

    constructor(private globalService: GlobalService) { }

    CloseWindow() {
        this.globalService.setData("closeUserPasswordWindow", true);
    }
}