import { Component } from '@angular/core';

@Component({
    selector: 'welccome',
    template: `
    <div class="welcome-head-container">
        <img src="assets/logo/icon.png" class="welcome-head-icon">
        <label class="welcome-label">ForUs</label>
    </div>
    <router-outlet></router-outlet>
    `,
    styleUrls: ['./welcome.css']
})

export class WelcomeComponent { }