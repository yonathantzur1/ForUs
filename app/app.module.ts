import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './components/app/app.component';
import { LoginComponent } from './components/login/login.component';
import { LoaderComponent } from './components/loader/loader.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DropMenuComponent } from './components/dropMenu/dropMenu.component';
import { ProfileComponent } from './components/profile/profile.component';

import { PageNotFoundComponent } from './components/pageNotFound/pageNotFound.component';

import { AuthService } from './services/auth/auth.service';
import { AuthGuard } from './components/login/auth.guard';

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
    HomeComponent,
    PageNotFoundComponent,
    NavbarComponent,
    DropMenuComponent,
    ProfileComponent
  ],
  providers: [
    AuthGuard,
    AuthService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }