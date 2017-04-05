import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'profile',
    templateUrl: 'views/profile.html',
    providers: []
})

export class ProfileComponent implements OnInit{
    constructor() { }

    OpenModal = function () {
        var x = 3;
    }

    ngOnInit() {
        var URL = window.URL;
        var $image = $('#main-img');
        var $inputImage = $('#inputImage');
        var uploadedImageURL: any;

        var options = {
            aspectRatio: 1 / 1,
            preview: '#preview-img-container',
            crop: function (e: any) {
            }
        };


        $('#main-img').cropper(options);

        if (URL) {
            $inputImage.change(function () {
                var files = this.files;
                var file;

                if (!$image.data('cropper')) {
                    return;
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
                    }
                    else {
                        $("#upload-failed").snackbar("show");
                    }
                }
            });
        }
        else {
            $inputImage.prop('disabled', true).parent().addClass('disabled');
        }
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

// (function($) {
//   $.fn.nodoubletapzoom = function() {
//       $(this).bind('touchstart', function preventZoom(e) {
//         var t2 = e.timeStamp
//           , t1 = $(this).data('lastTouch') || t2
//           , dt = t2 - t1
//           , fingers = e.originalEvent.touches.length;
//         $(this).data('lastTouch', t2);
//         if (!dt || dt > 600 || fingers > 1) return; // not double-tap

//         e.preventDefault(); // double tap - prevent the zoom
//         // also synthesize click events we just swallowed up
//         $(this).trigger('click').trigger('click');
//       });
//   };
// })(jQuery);

