import { Component, OnInit, HostListener } from '@angular/core';

import { GlobalService } from '../../../services/global/global.service';
import { EventService } from '../../../services/global/event.service';
import { AlertService, ALERT_TYPE } from '../../../services/global/alert.service';
import { SnackbarService } from '../../../services/global/snackbar.service';
import { ProfilePictureService } from '../../../services/profilePicture.service';

declare let $: any;

@Component({
    selector: 'profilePictureEdit',
    templateUrl: './profilePictureEdit.html',
    providers: [ProfilePictureService],
    styleUrls: ['./profilePictureEdit.css']
})

export class ProfilePictureEditComponent implements OnInit {

    isLoading: boolean = false;
    userImage: string;
    isNewPhoto: boolean = true;

    constructor(private profilePictureService: ProfilePictureService,
        public alertService: AlertService,
        public snackbarService: SnackbarService,
        public globalService: GlobalService,
        private eventService: EventService) { }

    ngOnInit() {
        this.userImage = this.globalService.userProfileImage;
        this.ActiveWindow();

        $("#profile-modal").bind('touchstart', this.PreventZoom);
    }

    options = {
        aspectRatio: 1 / 1,
        preview: '#preview-img-container',
        crop: function (e: any) { }
    };

    imageBtns = [
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
            onClick: function (self: any) {
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
                let imageData: any = $('#main-img').cropper("getData");
                let isImageFullRotate = (imageData.rotate % 180 == 0);

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

    ActiveWindow() {
        $('#main-img').cropper(this.options);
        $("#profile-modal").modal("show");
    }

    CloseWindow() {
        $("#profile-modal").removeClass("fade");
        $("#profile-modal").modal("hide");
        this.eventService.Emit("showProfileEditWindow", false);
    }

    ChangeImage() {
        let isSuccess = this.UploadPhoto(this.options);

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
    }

    UploadNewPhoto() {
        $("#inputImage").trigger("click");
    }

    EditUserPhoto() {
        $('#main-img').cropper('destroy').attr('src', this.userImage).cropper(this.options);
        this.isNewPhoto = false;
    }

    SaveImage() {
        // In case the user is not in the select part.
        if (!this.isNewPhoto) {
            this.isLoading = true;
            let self = this;

            this.GetCroppedBase64Image().then((img: any) => {
                let imgBase64 = img[0].currentSrc;
                self.profilePictureService.SaveImage(imgBase64).then((result: any) => {
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
                            type: ALERT_TYPE.INFO,
                            confirmBtnText: "אישור",
                            confirmFunc: function () {
                                self.CloseWindow();
                            }
                        });
                    }
                });
            });;
        }
    }

    DeleteImage() {
        // Disable modal close fade animation, close modal and return the fade animation. 
        $("#profile-modal").removeClass("fade");
        $("#profile-modal").modal("hide");

        let self = this;

        this.alertService.Alert({
            title: "למחוק את התמונה?",
            image: this.userImage,
            type: ALERT_TYPE.WARNING,
            disableEscapeExit: true,
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
    }

    UploadPhoto(options: any) {
        let URL = window.URL;
        let $image = $('#main-img');
        let $inputImage = $('#inputImage');
        let uploadedImageURL;

        if (URL) {
            let files = $inputImage[0].files;
            let file;

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
    }

    GetCroppedBase64Image() {
        return this.ResizeBase64Img($('#main-img').cropper('getCroppedCanvas').toDataURL(), 300, 300);
    }

    ResizeBase64Img(base64: any, width: any, height: any) {
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext("2d");
        let deferred = $.Deferred();

        $("<img/>").attr("src", base64).on('load', function () {
            context.scale(width / this.width, height / this.height);
            context.drawImage(this, 0, 0);
            deferred.resolve($("<img/>").attr("src", canvas.toDataURL()));
        });

        return deferred.promise();
    }

    PreventZoom(e: any) {
        let t2 = e.timeStamp
        let t1 = $(this).data('lastTouch') || t2
        let dt = t2 - t1
        let fingers = e.touches.length;
        $(this).data('lastTouch', t2);

        if (!dt || dt > 400 || fingers > 1) {
            return; // not double-tap
        }

        e.preventDefault(); // double tap - prevent the zoom
        // also synthesize click events we just swallowed up
        $(this).trigger('click').trigger('click');
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        // In case of pressing escape.
        if (event.code == "Escape") {
            this.CloseWindow();
        }
    }

}