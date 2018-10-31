import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Pipes
import { SortObjects } from '../pipes/sort/sort.pipe';

// Components
import { AppComponent } from '../components/app/app.component';
import { LoaderSpinnerComponent } from '../components/loaders/loaderSpinner/loaderSpinner.component';
import { LoaderDotsComponent } from '../components/loaders/loaderDots/loaderDots.component';
import { AlertComponent } from '../components/alert/alert.component';
import { SnackbarComponent } from '../components/snackbar/snackbar.component';
import { LoginComponent } from '../components/login/login.component';
import { ForgotPasswordComponent } from '../components/login/forgotPassword/forgotPassword.component';
import { HomeComponent } from '../components/home/home.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { DropMenuComponent } from '../components/dropMenu/dropMenu.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { ProfilePictureComponent } from '../components/profilePicture/profilePicture.component';
import { ChatComponent } from '../components/chat/chat.component';
import { ChatsWindowComponent } from '../components/navbar/chatsWindow/chatsWindow.component';
import { FriendRequestsWindowComponent } from '../components/navbar/friendRequestsWindow/friendRequestsWindow.component';
import { ManagementPanelComponent } from '../components/managementPanel/managementPanel.component';
import { ManagementComponent } from '../components/managementPanel/management/management.component';
import { StatisticsComponent } from '../components/managementPanel/statistics/statistics.component';
import { UsersReportsComponent } from '../components/managementPanel/usersReports/usersReports';
import { PermissionsCardComponent } from '../components/managementPanel/management/permissionsCard/permissionsCard.component';
import { UserPageComponent } from '../components/userPage/userPage.component';
import { UserEditWindowComponent } from '../components/userPage/userEditWindow/userEditWindow.component';
import { UserReportWindowComponent } from '../components/userPage/userReportWindow/userReportWindow.component';
import { UserPasswordWindowComponent } from '../components/userPage/userPasswordWindow/userPasswordWindow.component';
import { SearchPage } from '../components/searchPage/searchPage.component';

import { PageNotFoundComponent } from '../components/pageNotFound/pageNotFound.component';

// Guards
import { AuthGuard } from '../guards/auth/auth.guard';
import { RootAuthGuard } from '../guards/rootAuth/rootAuth.guard';
import { LoginGuard } from '../guards/login/login.guard';

// Global services
import { AuthService } from '../services/auth/auth.service';
import { GlobalService } from '../services/global/global.service';
import { AlertService } from '../services/alert/alert.service';
import { SnackbarService } from '../services/snackbar/snackbar.service';
import { MicrotextService } from '../services/microtext/microtext.service';

// Routing
import { Routing } from '../routes/app.routing'

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    Routing
  ],
  declarations: [
    // ---------Components---------
    AppComponent,
    LoaderSpinnerComponent,
    LoaderDotsComponent,
    AlertComponent,
    SnackbarComponent,
    LoginComponent,
    ForgotPasswordComponent,
    HomeComponent,
    PageNotFoundComponent,
    NavbarComponent,
    DropMenuComponent,
    ProfileComponent,
    ProfilePictureComponent,
    ChatComponent,
    ChatsWindowComponent,
    FriendRequestsWindowComponent,
    ManagementPanelComponent,
    ManagementComponent,
    StatisticsComponent,
    UsersReportsComponent,
    PermissionsCardComponent,
    UserPageComponent,
    UserEditWindowComponent,
    UserReportWindowComponent,
    UserPasswordWindowComponent,
    SearchPage,
    // ---------Pipes---------
    SortObjects
  ],
  providers: [
    AuthGuard,
    RootAuthGuard,
    LoginGuard,
    AuthService,
    GlobalService,
    AlertService,
    SnackbarService,
    MicrotextService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }