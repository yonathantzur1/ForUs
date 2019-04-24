import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Components
import { DeleteUserComponent } from './components/deleteUser/deleteUser.component';

// Routes
import { DeleteUserRoutingModule } from '../../routes/deleteUser/deleteUser.routing'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DeleteUserRoutingModule
    ],
    declarations: [
        DeleteUserComponent
    ]
})

export class DeleteUserModule { }