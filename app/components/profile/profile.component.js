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
require("./jsProfileFunctions.js");
var global_service_1 = require("../../services/global/global.service");
var alert_service_1 = require("../../services/alert/alert.service");
var profile_service_1 = require("../../services/profile/profile.service");
var ProfileComponent = /** @class */ (function () {
    function ProfileComponent(profileService, alertService, globalService) {
        this.profileService = profileService;
        this.alertService = alertService;
        this.globalService = globalService;
        this.isLoading = false;
        this.isNewPhoto = true;
        this.options = {
            aspectRatio: 1 / 1,
            preview: '#preview-img-container',
            crop: function (e) {
            }
        };
        this.imageBtns = [
            {
                icon: "fa-upload",
                title: "העלאת תמונה",
                onClick: function () {
                    $("#inputImage").trigger("click");
                }
            },
            {
                icon: "fa-refresh",
                title: "איפוס תמונה",
                onClick: function (self) {
                    self.ResetAllImageBtns();
                    $('#main-img').cropper("reset");
                }
            },
            {
                icon: "fa-arrows",
                title: "מצב תזוזה",
                onClick: function () {
                    if (this.isPressed) {
                        $('#main-img').cropper("setDragMode", "crop");
                    }
                    else {
                        $('#main-img').cropper("setDragMode", "move");
                    }
                    this.isPressed = !this.isPressed;
                },
                isPressed: false
            },
            {
                icon: "fa-rotate-right",
                title: "סיבוב ימינה",
                onClick: function () {
                    $('#main-img').cropper("rotate", 45);
                }
            },
            {
                icon: "fa-rotate-left",
                title: "סיבוב שמאלה",
                onClick: function () {
                    $('#main-img').cropper("rotate", -45);
                }
            },
            {
                icon: "fa-arrows-h",
                title: "היפוך אופקי",
                onClick: function () {
                    var imageData = $('#main-img').cropper("getData");
                    var isImageFullRotate = (imageData.rotate % 180 == 0);
                    // In case the btn is pressed.
                    if (this.isPressed) {
                        if (isImageFullRotate) {
                            $('#main-img').cropper("scaleX", 1);
                        }
                        else {
                            $('#main-img').cropper("scaleY", 1);
                        }
                    }
                    else {
                        if (isImageFullRotate) {
                            $('#main-img').cropper("scaleX", -1);
                        }
                        else {
                            $('#main-img').cropper("scaleY", -1);
                        }
                    }
                    this.isPressed = !this.isPressed;
                },
                isPressed: false
            },
            {
                icon: "fa-arrow-down",
                title: "הזזה למטה",
                onClick: function () {
                    $('#main-img').cropper("move", 0, 10);
                }
            },
            {
                icon: "fa-arrow-up",
                title: "הזזה למעלה",
                onClick: function () {
                    $('#main-img').cropper("move", 0, -10);
                }
            },
            {
                icon: "fa-arrow-right",
                title: "הזזה ימינה",
                onClick: function () {
                    $('#main-img').cropper("move", 10, 0);
                }
            },
            {
                icon: "fa-arrow-left",
                title: "הזזה שמאלה",
                onClick: function () {
                    $('#main-img').cropper("move", -10, 0);
                }
            },
            {
                icon: "fa-search-minus",
                title: "הקטנה",
                onClick: function () {
                    $('#main-img').cropper("zoom", -0.1);
                }
            },
            {
                icon: "fa-search-plus",
                title: "הגדלה",
                onClick: function () {
                    $('#main-img').cropper("zoom", 0.1);
                }
            }
        ];
    }
    ProfileComponent.prototype.ResetAllImageBtns = function () {
        this.imageBtns.forEach(function (btn) {
            // In case the btn is pressed.
            if (btn.isPressed) {
                btn.onClick();
            }
        });
    };
    ProfileComponent.prototype.ResetAllImageBtnsMode = function () {
        this.imageBtns.forEach(function (btn) {
            // In case the btn is pressed.
            if (btn.isPressed) {
                btn.isPressed = false;
            }
        });
    };
    ProfileComponent.prototype.ngOnInit = function () {
        this.userImage = this.globalService.userProfileImage;
        this.ActiveWindow();
        $("#profile-modal").bind('touchstart', function preventZoom(e) {
            var t2 = e.timeStamp, t1 = $(this).data('lastTouch') || t2, dt = t2 - t1, fingers = e.touches.length;
            $(this).data('lastTouch', t2);
            if (!dt || dt > 400 || fingers > 1)
                return; // not double-tap
            e.preventDefault(); // double tap - prevent the zoom
            // also synthesize click events we just swallowed up
            $(this).trigger('click').trigger('click');
        });
    };
    ProfileComponent.prototype.ActiveWindow = function () {
        $('#main-img').cropper(this.options);
        $("#profile-modal").modal("show");
    };
    ProfileComponent.prototype.CloseWindow = function () {
        $("#profile-modal").removeClass("fade");
        $("#profile-modal").modal("hide");
        this.globalService.setData("isOpenProfileEditWindow", false);
    };
    ProfileComponent.prototype.ChangeImage = function () {
        var isSuccess = UploadPhoto(this.options);
        if (isSuccess == true) {
            this.ResetAllImageBtnsMode();
            this.isNewPhoto = false;
        }
        else if (isSuccess == false) {
            snackbar("הקובץ שנבחר אינו תמונה");
        }
        else {
            snackbar("שגיאה בהעלאת התמונה");
        }
    };
    ProfileComponent.prototype.UploadNewPhoto = function () {
        $("#inputImage").trigger("click");
    };
    ProfileComponent.prototype.EditUserPhoto = function () {
        $('#main-img').cropper('destroy').attr('src', this.userImage).cropper(this.options);
        this.isNewPhoto = false;
    };
    ProfileComponent.prototype.SaveImage = function () {
        // In case the user is not in the select part.
        if (!this.isNewPhoto) {
            this.isLoading = true;
            var self = this;
            GetCroppedBase64Image().then(function (img) {
                var imgBase64 = img[0].currentSrc;
                self.profileService.SaveImage(imgBase64).then(function (result) {
                    self.isLoading = false;
                    // In case of error or the user was not fount.
                    if (!result) {
                        snackbar("שגיאה בהעלאת התמונה");
                        self.CloseWindow();
                    }
                    else {
                        // Disable modal close fade animation, close modal and return the fade animation. 
                        $("#profile-modal").removeClass("fade");
                        $("#profile-modal").modal("hide");
                        self.globalService.setData("newUploadedImage", imgBase64);
                        self.alertService.Alert({
                            title: "התמונה הוחלפה בהצלחה",
                            image: imgBase64,
                            showCancelButton: false,
                            type: "info",
                            confirmBtnText: "אוקיי",
                            confirmFunc: function () {
                                self.CloseWindow();
                            }
                        });
                    }
                });
            });
            ;
        }
    };
    ProfileComponent.prototype.DeleteImage = function () {
        // Disable modal close fade animation, close modal and return the fade animation. 
        $("#profile-modal").removeClass("fade");
        $("#profile-modal").modal("hide");
        var self = this;
        this.alertService.Alert({
            title: "למחוק את התמונה?",
            image: this.userImage,
            type: "warning",
            preConfirm: function () {
                return self.profileService.DeleteImage();
            },
            confirmFunc: function () {
                self.globalService.setData("isImageDeleted", true);
                self.CloseWindow();
            },
            closeFunc: function () {
                $("#profile-modal").removeClass("fade");
                $("#profile-modal").modal("show");
            }
        });
    };
    ProfileComponent = __decorate([
        core_1.Component({
            selector: 'profile',
            templateUrl: './profile.html',
            providers: [profile_service_1.ProfileService]
        }),
        __metadata("design:paramtypes", [profile_service_1.ProfileService,
            alert_service_1.AlertService,
            global_service_1.GlobalService])
    ], ProfileComponent);
    return ProfileComponent;
}());
exports.ProfileComponent = ProfileComponent;
//# sourceMappingURL=profile.component.js.map