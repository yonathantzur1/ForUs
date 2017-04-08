import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import './temp.js';

import { ProfileService } from '../../services/profile/profile.service';

declare function UploadPhoto(options: Object): boolean;

@Component({
    selector: 'profile',
    templateUrl: './profile.html',
    providers: [ProfileService]
})

export class ProfileComponent implements OnInit, OnChanges {
    constructor(private profileService: ProfileService) { }

    @Input() isOpenEditWindow: boolean;
    @Input() isNewPhoto: boolean;
    
    isLoading = false;

    options = {
        aspectRatio: 1 / 1,
        preview: '#preview-img-container',
        crop: function (e: any) {
        }
    };

    ChangeImage() {
        this.isLoading = true;
        var isSuccess = UploadPhoto(this.options);

        if (isSuccess == true) {
            this.isNewPhoto = false;
        }
        else if (isSuccess == false) {
            $("#image-failed").snackbar("show");
        }
        else {
            $("#upload-failed").snackbar("show");
        }

        this.isLoading = false;
    }

    ngOnChanges(simpleChanges: any) {
        if (simpleChanges.isOpenEditWindow.currentValue) {
            $("#profile-modal").modal("show");
        }
        else {
            $("#profile-modal").modal("hide");
        }
    }

    UploadNewPhoto() {
        $("#inputImage").trigger("click");
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

        $('#main-img').cropper(this.options);
    }

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
            onClick: function () {
                $('#main-img').cropper("reset");
            }
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
            icon: "fa-crop",
            title: "מצב חיתוך",
            onClick: function () {
                $('#main-img').cropper("setDragMode", "crop");
            }
        },
        {
            icon: "fa-arrows",
            title: "מצב תזוזה",
            onClick: function () {
                $('#main-img').cropper("setDragMode", "move");
            }
        }
    ];

}