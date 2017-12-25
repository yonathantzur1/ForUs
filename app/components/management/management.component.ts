import { Component } from '@angular/core';
import { Router } from '@angular/router';

class User {

}

@Component({
    selector: 'management',
    templateUrl: './management.html',
    providers: []
})

export class ManagementComponent {
    Users: Array<User> = [];

    constructor(private router: Router) { }
}