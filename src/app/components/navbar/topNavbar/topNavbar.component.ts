import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { PermissionsService } from '../../../services/global/permissions.service';
import { EventService } from '../../../services/global/event.service';
import { SnackbarService } from '../../../services/global/snackbar.service';
import { DropMenuData } from '../../dropMenu/dropMenu.component';

declare let $: any;

@Component({
    selector: 'topNavbar',
    templateUrl: './topNavbar.html',
    providers: [],
    styleUrls: ['./topNavbar.css']
})

export class TopNavbarComponent implements OnInit, OnDestroy {
    @Input() user: any;
    @Input() Logout: Function;
    @Input() ClosePopups: Function;
    @Input() CloseChatWindow: Function;
    @Input() isDropMenuOpen: boolean;
    @Output() isDropMenuOpenChange = new EventEmitter();

    isNavbarUnder: boolean = false;
    dropMenuDataList: Array<DropMenuData>;

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        private permissionsService: PermissionsService,
        private eventService: EventService,
        public snackbarService: SnackbarService) {

        let self = this;

        eventService.Register("setNavbarUnder", () => {
            self.isNavbarUnder = true;
        }, self.eventsIds);

        eventService.Register("setNavbarTop", () => {
            self.isNavbarUnder = false;
        }, self.eventsIds);
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
                self.Logout();
            })
        ];
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    }

    NavigateMain() {
        this.ClosePopups();
        this.CloseChatWindow();
        this.eventService.Emit("changeSearchInput", '');
        this.router.navigateByUrl('');
    }

    IsShowHeadTitle() {
        return ($(window).width() > 576);
    }

    ShowHideDropMenu() {
        this.isDropMenuOpen = !this.isDropMenuOpen;
        this.isDropMenuOpenChange.emit(this.isDropMenuOpen);

        if (this.isDropMenuOpen) {
            this.eventService.Emit("hideSidenav");
            this.eventService.Emit("hideSearchResults");
        }
    }
}