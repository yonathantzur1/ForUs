import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { PageNotFoundComponent } from './components/pageNotFound/pageNotFound.component';

// Routes
import { PageNotFoundRoutingModule } from '../../routes/pageNotFound/pageNotFound.routing'

@NgModule({
    imports: [
        CommonModule,
        PageNotFoundRoutingModule
    ],
    declarations: [
        PageNotFoundComponent
    ]
})

export class PageNotFoundModule { }