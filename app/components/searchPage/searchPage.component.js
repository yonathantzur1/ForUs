"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var alert_service_1 = require("../../services/alert/alert.service");
var global_service_1 = require("../../services/global/global.service");
var searchPage_service_1 = require("../../services/searchPage/searchPage.service");
var FriendsStatus = /** @class */ (function () {
    function FriendsStatus() {
    }
    return FriendsStatus;
}());
var SearchPage = /** @class */ (function () {
    function SearchPage(router, route, alertService, globalService, searchPageService) {
        this.router = router;
        this.route = route;
        this.alertService = alertService;
        this.globalService = globalService;
        this.searchPageService = searchPageService;
        this.isLoading = false;
    }
    SearchPage.prototype.ngOnInit = function () {
        var _this = this;
        var errorJson = {
            title: "שגיאה",
            text: "אופס... שגיאה בטעינת הדף",
            showCancelButton: false,
            type: alert_service_1.ALERT_TYPE.DANGER
        };
        // In case of route params changes.
        this.route.params.subscribe(function (params) {
            _this.searchString = params["name"];
            _this.isLoading = true;
            _this.searchPageService.GetUserFriendsStatus().then(function (friendsStatus) {
                if (friendsStatus) {
                    // Search users by given name parameter.
                    _this.searchPageService.GetSearchResults(_this.searchString).then(function (users) {
                        _this.isLoading = false;
                        if (users) {
                            users.forEach(function (user) {
                                var userId = user._id;
                                // In case the result user and the current user are friends.
                                if (friendsStatus.friends.indexOf(userId) != -1) {
                                    user.isFriend = true;
                                }
                                // In case the result user sent a friend request to the current user.
                                else if (friendsStatus.get.indexOf(userId) != -1) {
                                    user.isSendFriendRequest = true;
                                }
                                // In case the current user sent a friend request to the result user.
                                else if (friendsStatus.send.indexOf(userId) != -1) {
                                    user.isGetFriendRequest = true;
                                }
                            });
                            _this.users = users;
                        }
                        else {
                            _this.alertService.Alert(errorJson);
                        }
                    });
                }
                else {
                    _this.isLoading = false;
                    _this.alertService.Alert(errorJson);
                }
            });
        });
    };
    SearchPage.prototype.UserClick = function (userId) {
        this.router.navigateByUrl('/profile/' + userId);
    };
    SearchPage.prototype.isFriendRequestAction = function (user) {
        if ((!user.isFriend && this.globalService.userId != user._id) ||
            user.isGetFriendRequest ||
            user.isSendFriendRequest) {
            return true;
        }
        return false;
    };
    SearchPage.prototype.AddFriendRequest = function (user) {
        this.globalService.setData("addFriendRequest", user._id);
        user.isGetFriendRequest = true;
    };
    SearchPage.prototype.RemoveFriendRequest = function (user) {
        this.globalService.setData("removeFriendRequest", user._id);
        user.isGetFriendRequest = false;
    };
    SearchPage = __decorate([
        core_1.Component({
            selector: 'searchPage',
            templateUrl: './searchPage.html',
            providers: [searchPage_service_1.SearchPageService]
        }),
        __metadata("design:paramtypes", [router_1.Router,
            router_1.ActivatedRoute,
            alert_service_1.AlertService,
            global_service_1.GlobalService,
            searchPage_service_1.SearchPageService])
    ], SearchPage);
    return SearchPage;
}());
exports.SearchPage = SearchPage;
//# sourceMappingURL=searchPage.component.js.map