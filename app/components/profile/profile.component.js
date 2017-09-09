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
require("./temp.js");
var global_service_1 = require("../../services/global/global.service");
var profile_service_1 = require("../../services/profile/profile.service");
var ProfileComponent = /** @class */ (function () {
    function ProfileComponent(profileService, globalService) {
        var _this = this;
        this.profileService = profileService;
        this.globalService = globalService;
        this.isLoading = false;
        this.userImage = false;
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
        this.globalService.data.subscribe(function (value) {
            if (value["userImage"] != null) {
                _this.userImage = value["userImage"];
            }
            if (value["isOpenEditWindow"]) {
                _this.isNewPhoto = true;
                _this.isOpenEditWindow = value["isOpenEditWindow"];
                _this.ActiveWindow();
            }
        });
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
        $("#profile-modal").bind('touchstart', function preventZoom(e) {
            var t2 = e.timeStamp, t1 = $(this).data('lastTouch') || t2, dt = t2 - t1, fingers = e.touches.length;
            $(this).data('lastTouch', t2);
            if (!dt || dt > 500 || fingers > 1)
                return; // not double-tap
            e.preventDefault(); // double tap - prevent the zoom
            // also synthesize click events we just swallowed up
            $(this).trigger('click').trigger('click');
        });
    };
    ProfileComponent.prototype.ngOnChanges = function (simpleChanges) {
        if (simpleChanges.isOpenEditWindow.currentValue) {
            this.ActiveWindow();
        }
        else {
            this.DisableWindow();
        }
    };
    ProfileComponent.prototype.ActiveWindow = function () {
        $('#main-img').cropper(this.options);
        $("#profile-modal").modal("show");
    };
    ProfileComponent.prototype.DisableWindow = function () {
        $("#profile-modal").modal("hide");
    };
    ProfileComponent.prototype.ChangeImage = function () {
        var isSuccess = UploadPhoto(this.options);
        if (isSuccess == true) {
            this.ResetAllImageBtnsMode();
            this.isNewPhoto = false;
        }
        else if (isSuccess == false) {
            $("#image-failed").snackbar("show");
        }
        else {
            $("#upload-failed").snackbar("show");
        }
    };
    ProfileComponent.prototype.UploadNewPhoto = function () {
        $("#inputImage").trigger("click");
    };
    ProfileComponent.prototype.EditUserPhoto = function () {
        this.imgSrc = this.userImage;
        $('#main-img').cropper('destroy').attr('src', this.imgSrc).cropper(this.options);
        this.isNewPhoto = false;
    };
    ProfileComponent.prototype.SaveImage = function () {
        // In case the user is not in the select part.
        if (!this.isNewPhoto) {
            this.isLoading = true;
            var self = this;
            GetCroppedBase64Image().then(function (img) {
                var imgBase64 = img["0"].currentSrc;
                self.profileService.SaveImage(imgBase64).then(function (result) {
                    self.isLoading = false;
                    // In case of error or the user was not fount.
                    if (!result) {
                        $("#upload-failed").snackbar("show");
                    }
                    else {
                        $("#profile-modal").modal("hide");
                        self.globalService.setData("newUploadedImage", imgBase64);
                        swal({
                            html: '<span style="font-weight:bold;">התמונה הוחלפה בהצלחה</span> <i class="fa fa-thumbs-o-up" aria-hidden="true"></i>',
                            imageUrl: imgBase64,
                            imageWidth: 150,
                            imageHeight: 150,
                            animation: false,
                            confirmButtonText: "אוקיי"
                        });
                        setToken(result.token);
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
        $("#profile-modal").addClass("fade");
        var self = this;
        swal({
            html: '<span style="font-weight:bold;">למחוק את התמונה</span> <i class="fa fa-question" aria-hidden="true"></i>',
            imageUrl: this.userImage,
            imageWidth: 150,
            imageHeight: 150,
            animation: false,
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "כן",
            cancelButtonText: "לא",
            showLoaderOnConfirm: true,
            allowOutsideClick: false,
            preConfirm: function () {
                return self.profileService.DeleteImage();
            }
        }).then(function (result) {
            if (result) {
                self.globalService.setData("isImageDeleted", true);
                swal({
                    html: '<span style="font-weight:bold;">התמונה נמחקה בהצלחה</span> <i class="fa fa-thumbs-o-up" aria-hidden="true"></i>',
                    type: "success",
                    confirmButtonText: "אוקיי"
                });
                setToken(result.token);
            }
            else {
            }
        }, function (dismiss) { });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ProfileComponent.prototype, "isOpenEditWindow", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], ProfileComponent.prototype, "isNewPhoto", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], ProfileComponent.prototype, "imgSrc", void 0);
    ProfileComponent = __decorate([
        core_1.Component({
            selector: 'profile',
            templateUrl: './profile.html',
            providers: [profile_service_1.ProfileService]
        }),
        __metadata("design:paramtypes", [profile_service_1.ProfileService, global_service_1.GlobalService])
    ], ProfileComponent);
    return ProfileComponent;
}());
exports.ProfileComponent = ProfileComponent;
//# sourceMappingURL=profile.component.js.map