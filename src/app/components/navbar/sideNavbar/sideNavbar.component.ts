import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../../services/global/global.service';
import { ImageService } from '../../../services/global/image.service';
import { SocketService } from '../../../services/global/socket.service';
import { PermissionsService } from '../../../services/global/permissions.service';
import { CookieService } from '../../../services/global/cookie.service';
import { EventService } from '../../../services/global/event.service';
import { AlertService, ALERT_TYPE } from '../../../services/global/alert.service';
import { SnackbarService } from '../../../services/global/snackbar.service';
import { AuthService } from '../../../services/global/auth.service';
import { NavbarService } from '../../../services/navbar.service';
import { LoginService } from '../../../services/welcome/login.service';
import { SOCKET_STATE } from '../../../enums/enums';
import { DropMenuData } from '../../dropMenu/dropMenu.component';

class Friend {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    isOnline: boolean;
    isTyping: boolean;
    typingTimer: any;
}

export enum TOOLBAR_ID {
    MESSAGES,
    FRIEND_REQUESTS
}

class ToolbarItem {
    id: TOOLBAR_ID;
    icon: string;
    title: string;
    content: Object;
    getNotificationsNumber: Function;
    isShowToolbarItemBadget: Function;
    onClick: Function;

    constructor(id: TOOLBAR_ID, icon: string, title: string, content: Object,
        getNotificationsNumber: Function, isShowToolbarItemBadget: Function, onClick: Function) {
        this.id = id;
        this.icon = icon;
        this.title = title;
        this.content = content;
        this.getNotificationsNumber = getNotificationsNumber;
        this.isShowToolbarItemBadget = isShowToolbarItemBadget;
        this.onClick = onClick;
    }
}

declare let $: any;

@Component({
    selector: 'sideNavbar',
    templateUrl: './sideNavbar.html',
    providers: [NavbarService, LoginService],
    styleUrls: ['./sideNavbar.css']
})

export class SideNavbarComponent {

}