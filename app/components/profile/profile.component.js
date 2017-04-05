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
var core_1 = require("@angular/core");
var ProfileComponent = (function () {
    function ProfileComponent() {
        this.OpenModal = function () {
            var x = 3;
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
    ProfileComponent.prototype.ngOnInit = function () {
        var URL = window.URL;
        var $image = $('#main-img');
        var $inputImage = $('#inputImage');
        var uploadedImageURL;
        var options = {
            aspectRatio: 1 / 1,
            preview: '#preview-img-container',
            crop: function (e) {
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
    };
    return ProfileComponent;
}());
ProfileComponent = __decorate([
    core_1.Component({
        selector: 'profile',
        templateUrl: 'views/profile.html',
        providers: []
    }),
    __metadata("design:paramtypes", [])
], ProfileComponent);
exports.ProfileComponent = ProfileComponent;
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
//# sourceMappingURL=profile.component.js.map