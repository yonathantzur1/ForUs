import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Pipes import
import { SortObjects } from './pipes/sort/sort.pipe';

// Components import
import { AppComponent } from './components/app/app.component';
import { LoginComponent } from './components/login/login.component';
import { LoaderComponent } from './components/loader/loader.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DropMenuComponent } from './components/dropMenu/dropMenu.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfilePictureComponent } from './components/profilePicture/profilePicture.component';
import { ChatComponent } from './components/chat/chat.component';
import { ChatsWindowComponent } from './components/chatsWindow/chatsWindow.component';
import { FriendRequestsWindowComponent } from './components/friendRequestsWindow/friendRequestsWindow.component';
import { ManagementComponent } from './components/management/management.component';

import { PageNotFoundComponent } from './components/pageNotFound/pageNotFound.component';

import { AuthGuard, AdminAuthGuard } from './auth/auth.guard';
import { AuthService } from './services/auth/auth.service';

import { routing } from './app.routing'

import { GlobalService } from './services/global/global.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
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
    ProfileComponent,
    ProfilePictureComponent,
    ChatComponent,
    ChatsWindowComponent,
    FriendRequestsWindowComponent,
    ManagementComponent,
    SortObjects
  ],
  providers: [
    AuthGuard,
    AdminAuthGuard,
    AuthService,
    GlobalService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }