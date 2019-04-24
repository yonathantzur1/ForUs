import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Components
import { ForgotPasswordComponent } from './components/forgotPassword/forgotPassword.component';

// Routes
import { ForgotPasswordRoutingModule } from '../../routes/forgotPassword/forgotPassword.routing'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ForgotPasswordRoutingModule
    ],
    declarations: [
        ForgotPasswordComponent
    ]
})

export class ForgotPasswordModule { }