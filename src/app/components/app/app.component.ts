import { Component } from '@angular/core';

import { AlertService } from '../../services/alert/alert.service';
import { SnackbarService } from '../../services/snackbar/snackbar.service';

@Component({
  selector: 'app',
  templateUrl: './main.html'
})

export class AppComponent {

  constructor(public alertService: AlertService,
    public snackbarService: SnackbarService) { }

}