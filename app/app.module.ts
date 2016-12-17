import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './components/app/app.component';
import { LoginComponent } from './components/login/login.component';
import { LoaderComponent } from './components/loader/loader.component';
import { HomeComponent } from './components/home/home.component';

import { AuthService } from './services/auth/auth.service';
import { LoginService } from './services/login/login.service';
import { HomeService } from './services/home/home.service';

import { AuthGuard } from './components/login/auth.guard';
import { AuthGuardLogin } from './components/login/auth.guard.login';

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
    LoaderComponent,
    HomeComponent
  ],
  providers: [
    AuthGuard,
    AuthGuardLogin,
    AuthService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }