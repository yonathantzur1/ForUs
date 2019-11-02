import { Component, Host, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { PermissionsService } from '../../../services/global/permissions.service';
import { EventService, EVENT_TYPE } from '../../../services/global/event.service';
import { SnackbarService } from '../../../services/global/snackbar.service';
import { DropMenuData } from '../../dropMenu/dropMenu.component';
import { NavbarComponent } from '../navbar.component';

declare let $: any;

@Component({
    selector: 'topNavbar',
    templateUrl: './topNavbar.html',
    providers: [],
    styleUrls: ['./topNavbar.css']
})

export class TopNavbarComponent implements OnInit, OnDestroy {
    @Input() user: any;
    @Input() isShowDropMenu: boolean;
    @Output() isShowDropMenuChange = new EventEmitter();

    isNavbarUnder: boolean = false;
    dropMenuDataList: Array<DropMenuData>;

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        private permissionsService: PermissionsService,
        private eventService: EventService,
        public snackbarService: SnackbarService,
        @Host() public parent: NavbarComponent) {

        let self = this;

        //#region events

        eventService.Register(EVENT_TYPE.setNavbarUnder, () => {
            self.isNavbarUnder = true;
        }, self.eventsIds);

        eventService.Register(EVENT_TYPE.setNavbarTop, () => {
            self.isNavbarUnder = false;
        }, self.eventsIds);

        //#endregion
    }

    ngOnInit() {
        let self = this;

        self.dropMenuDataList = [
            new DropMenuData("/panel", "ניהול", null, () => {
                return self.permissionsService.IsUserHasRootPermission();
            }),
            new DropMenuData("/profile/" + self.user._id, "פרופיל"),
            new DropMenuData("/login", "התנתקות", () => {
                self.snackbarService.HideSnackbar();
                self.parent.Logout();
            })
        ];
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    }

    NavigateMain() {
        this.parent.ClosePopups();
        this.parent.CloseChatWindow();
        this.eventService.Emit(EVENT_TYPE.changeSearchInput, '');
        this.router.navigateByUrl('');
    }

    IsShowMainTitle() {
        return ($(window).width() > 576);
    }

    ShowHideDropMenu() {
        let isShowDropMenu = !this.isShowDropMenu;
        this.isShowDropMenuChange.emit(isShowDropMenu);

        if (isShowDropMenu) {
            this.eventService.Emit(EVENT_TYPE.hideSidenav);
            this.eventService.Emit(EVENT_TYPE.hideSearchResults);
        }
    }
}