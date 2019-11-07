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

        eventService.Register(EVENT_TYPE.hideSearchResults, () => {
            this.isShowSearchResults = false;
        }, this.eventsIds);

        eventService.Register(EVENT_TYPE.changeSearchInput, (input: string) => {
            this.searchInput = input;
        }, this.eventsIds);

        eventService.Register(EVENT_TYPE.removeUserFromNavbarSearchCache, (userId: string) => {
            this.RemoveUserFromNavbarSearchCache(userId);
        }, this.eventsIds);

        eventService.Register(EVENT_TYPE.openUserProfile, (user: any) => {
            this.OpenUserProfile(user);
        }, this.eventsIds);

        eventService.Register(EVENT_TYPE.showNewFriendsLabel, () => {
            clearTimeout(this.newFriendsLabelTimeout);
            this.isShowNewFriendsLabel = true;

            this.newFriendsLabelTimeout = setTimeout(() => {
                this.isShowNewFriendsLabel = false;
            }, this.newFriendsLabelDelay);
        }, this.eventsIds);

        let self = this;

        self.socketService.SocketOn('UserSetToPrivate', (userId: string) => {
            self.RemoveUserFromNavbarSearchCache(userId);
        });

        self.socketService.SocketOn('ClientRemoveFriend', function (userId: string) {
            self.RemoveUserFromNavbarSearchCache(userId);
        });
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    }

    SearchChange(input: string) {
        this.markedResult = null;
        this.isShowNewFriendsLabel = false;
        this.inputInterval && clearTimeout(this.inputInterval);

        let self = this;

        // In case the input is not empty.
        if (input && (input = input.trim())) {
            // Recover search results from cache if exists.
            let cachedUsers = this.GetSearchUsersFromCache(input);

            // In case cached users result found for this query input.
            if (cachedUsers) {
                this.GetResultImagesFromCache(cachedUsers);
                this.searchResults = cachedUsers;
                this.ShowSearchResults();
            }

            // Clear cached users (with full profiles) from memory.
            cachedUsers = null;

            self.inputInterval = setTimeout(() => {
                self.navbarService.GetMainSearchResults(input).then((results: Array<any>) => {
                    if (results &&
                        results.length > 0 &&
                        $("#" + self.searchInputId).is(":focus") &&
                        input == self.searchInput.trim()) {
                        self.InsertSearchUsersToCache(input, results);
                        self.GetResultImagesFromCache(results);
                        self.searchResults = results;
                        self.ShowSearchResults();

                        self.navbarService.GetMainSearchResultsWithImages(self.GetResultsIds(results)).then((profiles: any) => {
                            if (profiles && Object.keys(profiles).length > 0 && input == self.searchInput.trim()) {
                                self.searchResults.forEach((result: any) => {
                                    if (result.originalProfile) {
                                        result.profile = profiles[result.originalProfile];
                                    }
                                });

                                self.InsertResultsImagesToCache(profiles);
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


    ClickSearchInput(input: string) {
        if (input) {
            this.isShowSearchResults = true;
            this.SearchChange(this.searchInput);
        }
        else {
            this.isShowSearchResults = false;
        }

        this.parent.HideSidenav();
        this.parent.HideDropMenu();
    }

    ShowSearchResults() {
        this.isShowSearchResults = true;

        if (this.isShowSearchResults) {
            this.parent.HideSidenav();
            this.parent.HideDropMenu();
        }
    }

    GetFilteredSearchResults(searchInput: string): Array<any> {
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

    InsertSearchUsersToCache(searchInput: string, results: Array<any>) {
        let resultsClone: Array<any> = [];

        results.forEach((result: any) => {
            resultsClone.push(Object.assign({}, result));
        });

        this.searchCache[searchInput] = resultsClone;
    }

    GetSearchUsersFromCache(searchInput: string) {
        return this.searchCache[searchInput];
    }

    InsertResultsImagesToCache(profiles: any) {
        let self = this;

        Object.keys(profiles).forEach((profileId: string) => {
            self.profilesCache[profileId] = profiles[profileId];
        });
    }

    GetResultImagesFromCache(results: any) {
        let self = this;

        results.forEach((result: any) => {
            if (result.originalProfile && (self.profilesCache[result.originalProfile] != null)) {
                result.profile = self.profilesCache[result.originalProfile];
            }
        });
    }

    RemoveUserFromNavbarSearchCache(userId: string) {
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

    GetResultsIds(results: Array<any>) {
        let profilesIds: Array<string> = [];

        results.forEach((result: any) => {
            let id: string = result.originalProfile;
            id && profilesIds.push(id);
        });

        return profilesIds;
    }

    SearchKeyUp(event: any) {
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
                        this.OpenSearchPage(this.searchInput);
                    }
                    else {
                        this.OpenUserProfile(this.searchResults[this.markedResult - 2]);
                    }
                }
                else {
                    this.OpenSearchPage(this.searchInput);
                }
            }
            else if (event.key == "Escape") {
                this.isShowSearchResults = false;
            }
        }
        else if (this.searchResults.length == 0 &&
            this.searchInput &&
            (event.key == "Enter" || event.key == "NumpadEnter")) {
            this.OpenSearchPage(this.searchInput);
        }
    }

    OpenSearchPage(name: string) {
        $("#" + this.searchInputId).blur();
        this.isShowSearchResults = false;
        this.parent.CloseChatWindow();
        this.router.navigateByUrl("/search/" + name.trim());
    }

    OpenUserProfile(user: any) {
        $("#" + this.searchInputId).blur();
        this.isShowSearchResults = false;
        this.searchInput = user.fullName;
        this.router.navigateByUrl("/profile/" + user._id);
    }

    IsShowAddFriendRequestBtn(friendId: string) {
        let friendRequests: any = this.parent.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;

        return (friendId != this.parent.user._id &&
            !this.parent.user.friends.includes(friendId) &&
            !friendRequests.send.includes(friendId) &&
            !friendRequests.get.includes(friendId));
    }

    IsShowRemoveFriendRequestBtn(friendId: string) {
        let friendRequests: any = this.parent.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;

        if (friendRequests.send.includes(friendId)) {
            return true;
        }
        else {
            return false;
        }
    }

    IsIncomeFriendRequest(friendId: string) {
        let friendRequests: any = this.parent.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;

        if (friendRequests.get.includes(friendId)) {
            return true;
        }
        else {
            return false;
        }
    }

    OverlayClicked() {
        this.isShowSearchResults = false;
    }

    AddFriendRequest(userId: string) {
        this.eventService.Emit(EVENT_TYPE.addFriendRequest, userId)
    }

    RemoveFriendRequest(userId: string) {
        this.eventService.Emit(EVENT_TYPE.removeFriendRequest, userId)
    }
}