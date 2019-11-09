import { Component, Host, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { ImageService } from 'src/app/services/global/image.service';
import { SocketService } from '../../../services/global/socket.service';
import { EventService, EVENT_TYPE } from '../../../services/global/event.service';
import { NavbarService } from '../../../services/navbar.service';
import { NavbarComponent, TOOLBAR_ID } from '../navbar.component';

declare let $: any;

@Component({
    selector: 'mainSearch',
    templateUrl: './mainSearch.html',
    providers: [NavbarService],
    styleUrls: ['./mainSearch.css']
})

export class MainSearchComponent implements OnDestroy {
    searchInput: string;
    isShowSearchResults: boolean;
    searchResults: Array<any> = [];
    markedResult: number = null;
    inputInterval: any;
    searchInputId: string = "search-input";
    isShowNewFriendsLabel: boolean = false;

    newFriendsLabelTimeout: any;

    newFriendsLabelDelay: number = 4000; // milliseconds
    searchInputChangeDelay: number = 220; // milliseconds

    // Search users cache objects
    searchCache: any = {};
    profilesCache: any = {};

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        public imageService: ImageService,
        private socketService: SocketService,
        public eventService: EventService,
        private navbarService: NavbarService,
        @Host() public parent: NavbarComponent) {

        eventService.register(EVENT_TYPE.hideSearchResults, () => {
            this.isShowSearchResults = false;
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.changeSearchInput, (input: string) => {
            this.searchInput = input;
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.removeUserFromNavbarSearchCache, (userId: string) => {
            this.removeUserFromNavbarSearchCache(userId);
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.openUserProfile, (user: any) => {
            this.openUserProfile(user);
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.showNewFriendsLabel, (value: boolean) => {
            clearTimeout(this.newFriendsLabelTimeout);

            if (value) {
                this.isShowNewFriendsLabel = value;

                this.newFriendsLabelTimeout = setTimeout(() => {
                    this.isShowNewFriendsLabel = false;
                }, this.newFriendsLabelDelay);
            }
        }, this.eventsIds);

        let self = this;

        self.socketService.SocketOn('UserSetToPrivate', (userId: string) => {
            self.removeUserFromNavbarSearchCache(userId);
        });

        self.socketService.SocketOn('ClientRemoveFriend', function (userId: string) {
            self.removeUserFromNavbarSearchCache(userId);
        });
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    }

    searchChange(input: string) {
        this.markedResult = null;
        this.isShowNewFriendsLabel = false;
        this.inputInterval && clearTimeout(this.inputInterval);

        let self = this;

        // In case the input is not empty.
        if (input && (input = input.trim())) {
            // Recover search results from cache if exists.
            let cachedUsers = this.getSearchUsersFromCache(input);

            // In case cached users result found for this query input.
            if (cachedUsers) {
                this.getResultImagesFromCache(cachedUsers);
                this.searchResults = cachedUsers;
                this.showSearchResults();
            }

            // Clear cached users (with full profiles) from memory.
            cachedUsers = null;

            self.inputInterval = setTimeout(() => {
                self.navbarService.GetMainSearchResults(input).then((results: Array<any>) => {
                    if (results &&
                        results.length > 0 &&
                        $("#" + self.searchInputId).is(":focus") &&
                        input == self.searchInput.trim()) {
                        self.insertSearchUsersToCache(input, results);
                        self.getResultImagesFromCache(results);
                        self.searchResults = results;
                        self.showSearchResults();

                        self.navbarService.GetMainSearchResultsWithImages(self.getResultsIds(results)).then((profiles: any) => {
                            if (profiles && Object.keys(profiles).length > 0 && input == self.searchInput.trim()) {
                                self.searchResults.forEach((result: any) => {
                                    if (result.originalProfile) {
                                        result.profile = profiles[result.originalProfile];
                                    }
                                });

                                self.insertResultsImagesToCache(profiles);
                            }
                        });
                    }
                });
            }, self.searchInputChangeDelay);
        }
        else {
            self.isShowSearchResults = false;
            self.searchResults = [];
        }
    }


    clickSearchInput(input: string) {
        if (input) {
            this.isShowSearchResults = true;
            this.searchChange(this.searchInput);
        }
        else {
            this.isShowSearchResults = false;
        }

        this.parent.hideSidenav();
        this.parent.hideDropMenu();
    }

    showSearchResults() {
        this.isShowSearchResults = true;

        if (this.isShowSearchResults) {
            this.parent.hideSidenav();
            this.parent.hideDropMenu();
        }
    }

    getFilteredSearchResults(searchInput: string): Array<any> {
        if (!searchInput) {
            return this.searchResults;
        }
        else {
            searchInput = searchInput.trim();
            searchInput = searchInput.replace(/\\/g, '');
            this.searchResults = this.searchResults.filter(function (result: any) {
                return ((result.fullName.indexOf(searchInput) == 0) ||
                    (result.fullNameReversed.indexOf(searchInput) == 0));
            });

            return this.searchResults;
        }
    }

    insertSearchUsersToCache(searchInput: string, results: Array<any>) {
        let resultsClone: Array<any> = [];

        results.forEach((result: any) => {
            resultsClone.push(Object.assign({}, result));
        });

        this.searchCache[searchInput] = resultsClone;
    }

    getSearchUsersFromCache(searchInput: string) {
        return this.searchCache[searchInput];
    }

    insertResultsImagesToCache(profiles: any) {
        let self = this;

        Object.keys(profiles).forEach((profileId: string) => {
            self.profilesCache[profileId] = profiles[profileId];
        });
    }

    getResultImagesFromCache(results: any) {
        let self = this;

        results.forEach((result: any) => {
            if (result.originalProfile && (self.profilesCache[result.originalProfile] != null)) {
                result.profile = self.profilesCache[result.originalProfile];
            }
        });
    }

    removeUserFromNavbarSearchCache(userId: string) {
        Object.keys(this.searchCache).forEach((searchInput: string) => {
            this.searchCache[searchInput] = this.searchCache[searchInput].filter((user: any) => {
                let isRemoveUser = (user._id == userId);

                if (isRemoveUser && user.originalProfile) {
                    delete this.profilesCache[user.originalProfile];
                }

                return (!isRemoveUser);
            });
        });
    }

    getResultsIds(results: Array<any>) {
        let profilesIds: Array<string> = [];

        results.forEach((result: any) => {
            let id: string = result.originalProfile;
            id && profilesIds.push(id);
        });

        return profilesIds;
    }

    searchKeyUp(event: any) {
        if (this.searchResults.length > 0 && this.isShowSearchResults) {
            if (event.key == "ArrowDown") {
                if (this.markedResult != null) {
                    this.markedResult = (this.markedResult + 1) % (this.searchResults.length + 2);
                }
                else {
                    this.markedResult = 2;
                }
            }
            else if (event.key == "ArrowUp") {
                if (this.markedResult != null) {
                    if (this.markedResult == 0) {
                        this.markedResult = this.searchResults.length + 1;
                    }
                    else {
                        this.markedResult -= 1;
                    }
                }
                else {
                    this.markedResult = 0;
                }
            }
            else if (event.key == "Enter" || event.key == "NumpadEnter") {
                if (this.markedResult != null) {
                    if (this.markedResult == 0 || this.markedResult == 1) {
                        this.openSearchPage(this.searchInput);
                    }
                    else {
                        this.openUserProfile(this.searchResults[this.markedResult - 2]);
                    }
                }
                else {
                    this.openSearchPage(this.searchInput);
                }
            }
            else if (event.key == "Escape") {
                this.isShowSearchResults = false;
            }
        }
        else if (this.searchResults.length == 0 &&
            this.searchInput &&
            (event.key == "Enter" || event.key == "NumpadEnter")) {
            this.openSearchPage(this.searchInput);
        }
    }

    openSearchPage(name: string) {
        $("#" + this.searchInputId).blur();
        this.isShowSearchResults = false;
        this.parent.closeChatWindow();
        this.router.navigateByUrl("/search/" + name.trim());
    }

    openUserProfile(user: any) {
        $("#" + this.searchInputId).blur();
        this.isShowSearchResults = false;
        this.searchInput = user.fullName;
        this.router.navigateByUrl("/profile/" + user._id);
    }

    isShowAddFriendRequestBtn(friendId: string) {
        let friendRequests: any = this.parent.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;

        return (friendId != this.parent.user._id &&
            !this.parent.user.friends.includes(friendId) &&
            !friendRequests.send.includes(friendId) &&
            !friendRequests.get.includes(friendId));
    }

    isShowRemoveFriendRequestBtn(friendId: string) {
        let friendRequests: any = this.parent.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;

        if (friendRequests.send.includes(friendId)) {
            return true;
        }
        else {
            return false;
        }
    }

    isIncomeFriendRequest(friendId: string) {
        let friendRequests: any = this.parent.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;

        if (friendRequests.get.includes(friendId)) {
            return true;
        }
        else {
            return false;
        }
    }

    overlayClicked() {
        this.isShowSearchResults = false;
    }

    addFriendRequest(userId: string) {
        this.eventService.Emit(EVENT_TYPE.addFriendRequest, userId)
    }

    removeFriendRequest(userId: string) {
        this.eventService.Emit(EVENT_TYPE.removeFriendRequest, userId)
    }
}