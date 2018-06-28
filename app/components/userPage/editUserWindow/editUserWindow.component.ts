import { Component, OnInit } from '@angular/core';

import { EditUserWindowService } from '../../../services/userPage/editUserWindow/editUserWindow.service.js';

@Component({
    selector: 'editUserWindow',
    templateUrl: './editUserWindow.html',
    providers: [EditUserWindowService]
})

export class EditUserWindowComponent implements OnInit {
    constructor(editUserWindowService: EditUserWindowService) { }

    ngOnInit() {
        
    }
}