import { Component, OnInit, OnDestroy, Input, Host } from '@angular/core';

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

    friendSearchInput: string = "";
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

        eventService.register(EVENT_TYPE.showHideChatsWindow, () => {
            self.showHideChatsWindow();
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.showHideFriendRequestsWindow, () => {
            self.showHideFriendRequestsWindow();
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.setUserFriendsLoading, (value: boolean) => {
            self.isFriendsLoading = value;
        }, self.eventsIds);

        //#endregion
    }

    ngOnInit() {
        this.loadFriendsData(this.user.friends);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    showHideSidenav() {
        this.eventService.emit(EVENT_TYPE.showNewFriendsLabel, false);

        if (this.parent.isShowSidenav) {
            this.parent.hideSidenav();
        }
        else {
            this.parent.isShowSidenav = true;
            this.parent.isHideNotificationsBudget = true;
            this.parent.hideDropMenu();
            this.eventService.emit(EVENT_TYPE.hideSearchResults);
            $("#sidenav").width(this.sidenavWidth);
            $("body").addClass("no-overflow");
        }
    }

    showHideChatsWindow() {
        this.parent.isChatsWindowOpen = !this.parent.isChatsWindowOpen;

        // Scroll chat window to top after the view is getting refreshed.
        setTimeout(() => {
            $("#chatsWindow .body-container")[0].scrollTop = 0
        }, 0);
    }

    showHideFriendRequestsWindow() {
        this.parent.isFriendRequestsWindowOpen = !this.parent.isFriendRequestsWindowOpen;

        // Scroll friend requests window to top after the view is getting refreshed.
        setTimeout(() => {
            $("#friendRequestsWindow .body-container")[0].scrollTop = 0
        }, 0);
    }

    isShowFriendFindInput() {
        return $(".sidenav-body-sector").hasScrollBar();
    }

    // Loading full friends objects to friends array.
    loadFriendsData(friendsIds: Array<string>) {
        if (friendsIds.length > 0) {
            this.isFriendsLoading = true;
            this.navbarService.getFriends(friendsIds).then((friendsResult: Array<Friend>) => {
                this.parent.friends = friendsResult;
                this.isFriendsLoading = false;
                this.socketService.socketEmit("ServerGetOnlineFriends");
            });
        }
    }

    getFilteredFriends(friendSearchInput: string): Array<any> {
        if (!friendSearchInput) {
            return this.parent.friends;
        }
        else {
            friendSearchInput = friendSearchInput.trim();
            friendSearchInput = friendSearchInput.replace(/\\/g, '');

            return this.parent.friends.filter((friend: any) => {
                return (((friend.firstName + " " + friend.lastName).indexOf(friendSearchInput) == 0) ||
                    ((friend.lastName + " " + friend.firstName).indexOf(friendSearchInput) == 0));
            });
        }
    }

    getSidebarFriends(friendSearchInput: string): Array<any> {
        return this.getFilteredFriends(friendSearchInput).sort((a, b) => {
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

    getFriendUnreadMessagesNumberText(friendId: string) {
        let friendNotificationsMessages = this.parent.getToolbarItem(TOOLBAR_ID.MESSAGES).content[friendId];

        if (friendNotificationsMessages) {
            return "- (" + friendNotificationsMessages.unreadMessagesNumber + ")"
        }
        else {
            return '';
        }
    }

    getNotificationsNumber() {
        let notificationsAmount = 0;

        this.parent.toolbarItems.forEach(item => {
            notificationsAmount += item.getNotificationsNumber();
        });

        return notificationsAmount;
    }

    searchNewFriends() {
        this.eventService.emit(EVENT_TYPE.changeSearchInput, '');
        setTimeout(() => {
            $("#" + this.searchInputId).focus();
            this.eventService.emit(EVENT_TYPE.showNewFriendsLabel, true);
        }, 0);
    }
}