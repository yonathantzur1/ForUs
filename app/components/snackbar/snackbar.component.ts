import { Component } from '@angular/core';

import { SnackbarService } from '../../services/snackbar/snackbar.service';

@Component({
    selector: 'snackbar',
    templateUrl: './snackbar.html',    
    styleUrls: ['./snackbar.css']
})

export class SnackbarComponent {
    constructor(private snackbarService: SnackbarService) { }
}