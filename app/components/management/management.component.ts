import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'management',
    templateUrl: './management.html',
    providers: []
})

export class ManagementComponent {
    constructor(private router: Router) { }

}