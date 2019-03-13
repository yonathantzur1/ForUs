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
var global_service_1 = require("../../../services/global/global.service");
var event_service_1 = require("../../../services/event/event.service");
var alert_service_1 = require("../../../services/alert/alert.service");
var snackbar_service_1 = require("../../../services/snackbar/snackbar.service");
var profilePicture_service_1 = require("../../../services/profilePicture/profilePicture.service");
var ProfilePictureEditComponent = /** @class */ (function () {
    function ProfilePictureEditComponent(profilePictureService, alertService, snackbarService, globalService, eventService) {
        this.profilePictureService = profilePictureService;
        this.alertService = alertService;
        this.snackbarService = snackbarService;
        this.globalService = globalService;
        this.eventService = eventService;
        this.isLoading = false;
        this.isNewPhoto = true;
        this.options = {
            aspectRatio: 1 / 1,
            preview: '#preview-img-container',
            crop: function (e) { }
        };
        this.imageBtns = [
            {
                icon: "fas fa-upload",
                title: "העלאת תמונה",
                onClick: function () {
                    $("#inputImage").trigger("click");
                }
            },
            {
                icon: "fas fa-sync",
                title: "איפוס תמונה",
                onClick: function (self) {
                    self.ResetAllImageBtns();
                    $('#main-img').cropper("reset");
                }
            },
            {
                icon: "fas fa-arrows-alt",
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
                icon: "fas fa-redo",
                title: "סיבוב ימינה",
                onClick: function () {
                    $('#main-img').cropper("rotate", 45);
                }
            },
            {
                icon: "fas fa-undo",
                title: "סיבוב שמאלה",
                onClick: function () {
                    $('#main-img').cropper("rotate", -45);
                }
            },
            {
                icon: "fas fa-arrows-alt-h",
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
                icon: "fas fa-arrow-down",
                title: "הזזה למטה",
                onClick: function () {
                    $('#main-img').cropper("move", 0, 10);
                }
            },
            {
                icon: "fas fa-arrow-up",
                title: "הזזה למעלה",
                onClick: function () {
                    $('#main-img').cropper("move", 0, -10);
                }
            },
            {
                icon: "fas fa-arrow-right",
                title: "הזזה ימינה",
                onClick: function () {
                    $('#main-img').cropper("move", 10, 0);
                }
            },
            {
                icon: "fas fa-arrow-left",
                title: "הזזה שמאלה",
                onClick: function () {
                    $('#main-img').cropper("move", -10, 0);
                }
            },
            {
                icon: "fas fa-minus",
                title: "הקטנה",
                onClick: function () {
                    $('#main-img').cropper("zoom", -0.1);
                }
            },
            {
                icon: "fas fa-plus",
                title: "הגדלה",
                onClick: function () {
                    $('#main-img').cropper("zoom", 0.1);
                }
            }
        ];
    }
    ProfilePictureEditComponent.prototype.ngOnInit = function () {
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
    ProfilePictureEditComponent.prototype.ResetAllImageBtns = function () {
        this.imageBtns.forEach(function (btn) {
            // In case the btn is pressed.
            if (btn.isPressed) {
                btn.onClick();
            }
        });
    };
    ProfilePictureEditComponent.prototype.ResetAllImageBtnsMode = function () {
        this.imageBtns.forEach(function (btn) {
            // In case the btn is pressed.
            if (btn.isPressed) {
                btn.isPressed = false;
            }
        });
    };
    ProfilePictureEditComponent.prototype.ActiveWindow = function () {
        $('#main-img').cropper(this.options);
        $("#profile-modal").modal("show");
    };
    ProfilePictureEditComponent.prototype.CloseWindow = function () {
        $("#profile-modal").removeClass("fade");
        $("#profile-modal").modal("hide");
        this.eventService.Emit("showProfileEditWindow", false);
    };
    ProfilePictureEditComponent.prototype.ChangeImage = function () {
        var isSuccess = this.UploadPhoto(this.options);
        if (isSuccess == true) {
            this.ResetAllImageBtnsMode();
            this.isNewPhoto = false;
        }
        else if (isSuccess == false) {
            this.snackbarService.Snackbar("הקובץ שנבחר אינו תמונה");
        }
        else {
            this.snackbarService.Snackbar("שגיאה בהעלאת התמונה");
        }
    };
    ProfilePictureEditComponent.prototype.UploadNewPhoto = function () {
        $("#inputImage").trigger("click");
    };
    ProfilePictureEditComponent.prototype.EditUserPhoto = function () {
        $('#main-img').cropper('destroy').attr('src', this.userImage).cropper(this.options);
        this.isNewPhoto = false;
    };
    ProfilePictureEditComponent.prototype.SaveImage = function () {
        // In case the user is not in the select part.
        if (!this.isNewPhoto) {
            this.isLoading = true;
            var self = this;
            this.GetCroppedBase64Image().then(function (img) {
                var imgBase64 = img[0].currentSrc;
                self.profilePictureService.SaveImage(imgBase64).then(function (result) {
                    self.isLoading = false;
                    // In case of error or the user was not fount.
                    if (!result) {
                        self.snackbarService.Snackbar("שגיאה בהעלאת התמונה");
                        self.CloseWindow();
                    }
                    else {
                        // Disable modal close fade animation, close modal and return the fade animation. 
                        $("#profile-modal").removeClass("fade");
                        $("#profile-modal").modal("hide");
                        self.eventService.Emit("newUploadedImage", imgBase64);
                        self.alertService.Alert({
                            title: "התמונה הוחלפה בהצלחה",
                            image: imgBase64,
                            showCancelButton: false,
                            type: alert_service_1.ALERT_TYPE.INFO,
                            confirmBtnText: "אישור",
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
    ProfilePictureEditComponent.prototype.DeleteImage = function () {
        // Disable modal close fade animation, close modal and return the fade animation. 
        $("#profile-modal").removeClass("fade");
        $("#profile-modal").modal("hide");
        var self = this;
        this.alertService.Alert({
            title: "למחוק את התמונה?",
            image: this.userImage,
            type: alert_service_1.ALERT_TYPE.WARNING,
            preConfirm: function () {
                return self.profilePictureService.DeleteImage();
            },
            confirmFunc: function () {
                self.eventService.Emit("deleteProfileImage", true);
                self.CloseWindow();
            },
            closeFunc: function () {
                $("#profile-modal").removeClass("fade");
                $("#profile-modal").modal("show");
            }
        });
    };
    ProfilePictureEditComponent.prototype.UploadPhoto = function (options) {
        var URL = window.URL;
        var $image = $('#main-img');
        var $inputImage = $('#inputImage');
        var uploadedImageURL;
        if (URL) {
            var files = $inputImage[0].files;
            var file;
            if (!$image.data('cropper')) {
                return null;
            }
            if (files && files.length) {
                file = files[0];
                if (/^image\/\w+$/.test(file.type)) {
                    if (uploadedImageURL) {
                        URL.revokeObjectURL(uploadedImageURL);
                    }
                    uploadedImageURL = URL.createObjectURL(file);
                    $image.cropper('destroy').attr('src', uploadedImageURL).cropper(options);
                    $inputImage.val('');
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            $inputImage.prop('disabled', true).parent().addClass('disabled');
            return null;
        }
    };
    ProfilePictureEditComponent.prototype.GetCroppedBase64Image = function () {
        return this.ResizeBase64Img($('#main-img').cropper('getCroppedCanvas').toDataURL(), 300, 300);
    };
    ProfilePictureEditComponent.prototype.ResizeBase64Img = function (base64, width, height) {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext("2d");
        var deferred = $.Deferred();
        $("<img/>").attr("src", base64).on('load', function () {
            context.scale(width / this.width, height / this.height);
            context.drawImage(this, 0, 0);
            deferred.resolve($("<img/>").attr("src", canvas.toDataURL()));
        });
        return deferred.promise();
    };
    ProfilePictureEditComponent.prototype.KeyPress = function (event) {
        // In case of pressing escape.
        if (event.code == "Escape") {
            this.CloseWindow();
        }
    };
    __decorate([
        core_1.HostListener('document:keyup', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], ProfilePictureEditComponent.prototype, "KeyPress", null);
    ProfilePictureEditComponent = __decorate([
        core_1.Component({
            selector: 'profilePictureEdit',
            templateUrl: './profilePictureEdit.html',
            providers: [profilePicture_service_1.ProfilePictureService],
            styleUrls: ['./profilePictureEdit.css']
        }),
        __metadata("design:paramtypes", [profilePicture_service_1.ProfilePictureService,
            alert_service_1.AlertService,
            snackbar_service_1.SnackbarService,
            global_service_1.GlobalService,
            event_service_1.EventService])
    ], ProfilePictureEditComponent);
    return ProfilePictureEditComponent;
}());
exports.ProfilePictureEditComponent = ProfilePictureEditComponent;
//# sourceMappingURL=profilePictureEdit.component.js.map