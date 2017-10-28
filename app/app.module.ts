import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { Pipe, PipeTransform } from '@angular/core';

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
import { UnreadWindowComponent } from './components/unreadWindow/unreadWindow.component';
import { FriendRequestsWindowComponent } from './components/friendRequestsWindow/friendRequestsWindow.component';

import { PageNotFoundComponent } from './components/pageNotFound/pageNotFound.component';

import { AuthService } from './services/auth/auth.service';
import { AuthGuard } from './components/login/auth.guard';

import { routing } from './app.routing'

import { GlobalService } from './services/global/global.service';

@Pipe({
  name: "orderByChatDates"
})
export class OrderByChatDates implements PipeTransform {
  transform(array: Array<string>, args: string): Array<string> {
    array.sort((a: any, b: any) => {
      var firstDate = new Date(a.lastMessage.time);
      var secondDate = new Date(b.lastMessage.time);

      if (firstDate > secondDate) {
        return -1;
      }
      else if (firstDate < secondDate) {
        return 1;
      }
      else {
        return 0;
      }
    });
    return array;
  }
}

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
    ProfileComponent,
    ProfilePictureComponent,
    ChatComponent,
    UnreadWindowComponent,
    FriendRequestsWindowComponent,
    OrderByChatDates
  ],
  providers: [
    AuthGuard,
    AuthService,
    GlobalService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }