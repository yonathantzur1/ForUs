import { Component } from '@angular/core';

import { AlertService } from '../../services/alert/alert.service';

@Component({
  selector: 'app',
  templateUrl: './main.html'
})

export class AppComponent {

  constructor(private alertService: AlertService) { }

}