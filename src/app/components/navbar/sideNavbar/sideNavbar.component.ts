import { Component, OnInit, OnDestroy, Input, Output, Host, EventEmitter } from '@angular/core';

import { ImageService } from '../../../services/global/image.service';
import { SocketService } from '../../../services/global/socket.service';
import { EventService, EVENT_TYPE } from '../../../services/global/event.service';
import { SnackbarService } from '../../../services/global/snackbar.service';
import { NavbarService } from '../../../services/navbar.service';
import { NavbarComponent, Friend, TOOLBAR_ID } from '../navbar.component';

declare let $: any;

@Component({
    selector: 'sideNavbar',
    templateUrl: './sideNavbar.html',
    providers: [NavbarService],
    styleUrls: ['./sideNavbar.css']
})

export class SideNavbarComponent implements OnInit, OnDestroy {
    @Input() user: any;
    @Input() friends: Array<Friend>;
    @Output() friendsChange = new EventEmitter();
    @Input() isShowSidenav: boolean;
    @Output() isShowSidenavChange = new EventEmitter();
    @Input() isHideNotificationsBudget: boolean;
    @Output() isHideNotificationsBudgetChange = new EventEmitter();

    sidenavWidth: string = "230px";
    searchInputId: string = "search-input";
    TOOLBAR_ID: any = TOOLBAR_ID;
    isFriendsLoading: boolean = false;

    eventsIds: Array<string> = [];

    constructor(public imageService: ImageService,
        private socketService: SocketService,
        private eventService: EventService,
        public snackbarService: SnackbarService,
        private navbarService: NavbarService,
        @Host() public parent: NavbarComponent) {

        let self = this;

        //#region events

        eventService.Register(EVENT_TYPE.showHideChatsWindow, () => {
            self.ShowHideChatsWindow();
        }, self.eventsIds);

        eventService.Register(EVENT_TYPE.showHideFriendRequestsWindow, () => {
            self.ShowHideFriendRequestsWindow();
        }, self.eventsIds);

        eventService.Register(EVENT_TYPE.setUserFriendsLoading, (value: boolean) => {
            self.isFriendsLoading = value;
        }, self.eventsIds);

        //#endregion
    }

    ngOnInit() {
        this.LoadFriendsData(this.user.friends);
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    }

    ShowHideSidenav() {
        this.eventService.Emit(EVENT_TYPE.showNewFriendsLabel, false);

        if (this.isShowSidenav) {
            this.parent.HideSidenav();
        }
        else {
            this.isShowSidenavChange.emit(true);
            this.isHideNotificationsBudget = true;
            this.parent.HideDropMenu();
            this.eventService.Emit(EVENT_TYPE.hideSearchResults);
            $("#sidenav").width(this.sidenavWidth);
            $("body").addClass("no-overflow");
        }
    }

    ShowHideChatsWindow() {
        this.parent.isChatsWindowOpen = !this.parent.isChatsWindowOpen;

        // Scroll chat window to top after the view is getting refreshed.
        setTimeout(() => {
            $("#chatsWindow .body-container")[0].scrollTop = 0
        }, 0);
    }

    ShowHideFriendRequestsWindow() {
        this.parent.isFriendRequestsWindowOpen = !this.parent.isFriendRequestsWindowOpen;

        // Scroll friend requests window to top after the view is getting refreshed.
        setTimeout(() => {
            $("#friendRequestsWindow .body-container")[0].scrollTop = 0
        }, 0);
    }

    IsShowFriendFindInput() {
        return $(".sidenav-body-sector").hasScrollBar();
    }

    // Loading full friends objects to friends array.
    LoadFriendsData(friendsIds: Array<string>) {
        if (friendsIds.length > 0) {
            this.isFriendsLoading = true;
            this.navbarService.GetFriends(friendsIds).then((friendsResult: Array<Friend>) => {
                this.friendsChange.emit(friendsResult);
                this.isFriendsLoading = false;
                this.socketService.SocketEmit("ServerGetOnlineFriends");
            });
        }
    }

    GetFilteredFriends(friendSearchInput: string): Array<any> {
        if (!friendSearchInput) {
            return this.friends;
        }
        else {
            friendSearchInput = friendSearchInput.trim();
            friendSearchInput = friendSearchInput.replace(/\\/g, '');

            return this.friends.filter((friend: any) => {
                return (((friend.firstName + " " + friend.lastName).indexOf(friendSearchInput) == 0) ||
                    ((friend.lastName + " " + friend.firstName).indexOf(friendSearchInput) == 0));
            });
        }
    }

    GetSidebarFriends(friendSearchInput: string): Array<any> {
        return this.GetFilteredFriends(friendSearchInput).sort((a, b) => {
            if (a.isOnline && !b.isOnline) {
                return -1;
            }
            else if (b.isOnline && !a.isOnline) {
                return 1;
            }
            else {
                let aName = a.firstName + " " + a.lastName;
                let bName = b.firstName + " " + b.lastName;

                if (aName > bName) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
        });
    }

    GetFriendUnreadMessagesNumberText(friendId: string) {
        let friendNotificationsMessages = this.parent.GetToolbarItem(TOOLBAR_ID.MESSAGES).content[friendId];

        if (friendNotificationsMessages) {
            return "- (" + friendNotificationsMessages.unreadMessagesNumber + ")"
        }
        else {
            return '';
        }
    }

    GetNotificationsNumber() {
        let notificationsAmount = 0;

        this.parent.toolbarItems.forEach(item => {
            notificationsAmount += item.getNotificationsNumber();
        });

        return notificationsAmount;
    }

    SearchNewFriends() {
        this.eventService.Emit(EVENT_TYPE.changeSearchInput, '');
        setTimeout(() => {
            $("#" + this.searchInputId).focus();
            this.eventService.Emit(EVENT_TYPE.showNewFriendsLabel, true);
        }, 0);
    }
}