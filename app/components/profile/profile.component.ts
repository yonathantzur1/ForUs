import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import './temp.js';

import { GlobalService } from '../../services/global/global.service';
import { ProfileService } from '../../services/profile/profile.service';

declare var swal: any;
declare var setToken: any;
declare function UploadPhoto(options: Object): boolean;
declare function GetCroppedBase64Image(): any;

@Component({
    selector: 'profile',
    templateUrl: './profile.html',
    providers: [ProfileService]
})

export class ProfileComponent implements OnInit, OnChanges {
    constructor(private profileService: ProfileService, private globalService: GlobalService) {
        this.globalService.data.subscribe(value => {

            if (value["userImage"] != null) {
                this.userImage = value["userImage"];
            }

            if (value["isOpenProfileEditWindow"]) {
                this.isNewPhoto = true;
                this.isOpenProfileEditWindow = value["isOpenProfileEditWindow"];
                this.ActiveWindow();
            }
        });
    }

    @Input() isOpenProfileEditWindow: boolean;
    @Input() isNewPhoto: boolean;
    @Input() imgSrc: string;

    isLoading: boolean = false;
    userImage: any = false;

    options = {
        aspectRatio: 1 / 1,
        preview: '#preview-img-container',
        crop: function (e: any) {
        }
    };

    imageBtns = [
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
            onClick: function (self: any) {
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
                var imageData: any = $('#main-img').cropper("getData");
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

    ResetAllImageBtns() {
        this.imageBtns.forEach(function (btn: any) {
            // In case the btn is pressed.
            if (btn.isPressed) {
                btn.onClick();
            }
        });
    }

    ResetAllImageBtnsMode() {
        this.imageBtns.forEach(function (btn: any) {
            // In case the btn is pressed.
            if (btn.isPressed) {
                btn.isPressed = false;
            }
        });
    }

    ngOnInit() {
        $("#profile-modal").bind('touchstart', function preventZoom(e) {
            var t2 = e.timeStamp
                , t1 = $(this).data('lastTouch') || t2
                , dt = t2 - t1
                , fingers = e.touches.length;
            $(this).data('lastTouch', t2);
            if (!dt || dt > 500 || fingers > 1) return; // not double-tap

            e.preventDefault(); // double tap - prevent the zoom
            // also synthesize click events we just swallowed up
            $(this).trigger('click').trigger('click');
        });
    }

    ngOnChanges(simpleChanges: any) {
        if (simpleChanges.isOpenProfileEditWindow.currentValue) {
            this.ActiveWindow();
        }
        else {
            this.DisableWindow();
        }
    }

    ActiveWindow() {
        $('#main-img').cropper(this.options);
        $("#profile-modal").modal("show");
    }

    DisableWindow() {
        $("#profile-modal").modal("hide");
    }

    ChangeImage() {
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
    }

    UploadNewPhoto() {
        $("#inputImage").trigger("click");
    }

    EditUserPhoto() {
        this.imgSrc = this.userImage;
        $('#main-img').cropper('destroy').attr('src', this.imgSrc).cropper(this.options);
        this.isNewPhoto = false;
    }

    SaveImage() {
        // In case the user is not in the select part.
        if (!this.isNewPhoto) {
            this.isLoading = true;
            var self = this;

            GetCroppedBase64Image().then(function (img: any) {
                var imgBase64 = img["0"].currentSrc;
                self.profileService.SaveImage(imgBase64).then((result: any) => {
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
            });;
        }
    }

    DeleteImage() {
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
            preConfirm: function (): any {
                return self.profileService.DeleteImage();
            }
        }).then(function (result: any) {
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
        }, function (dismiss: any) { });
    }

}