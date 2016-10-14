import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './components/app.component';
import { LoginComponent } from './components/login.component';
import { LoaderComponent } from './components/loader.component';

import { LoginService } from './services/login.service';

import { routing } from './app.routing'

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    LoaderComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }