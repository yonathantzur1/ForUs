function UploadPhoto(options) {
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

    }
    else {
        $inputImage.prop('disabled', true).parent().addClass('disabled');

        return null;
    }
}

function GetCroppedBase64Image() {
    return resizeBase64Img($('#main-img').cropper('getCroppedCanvas').toDataURL(), 300, 300);
}

function resizeBase64Img(base64, width, height) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext("2d");
    var deferred = $.Deferred();

    $("<img/>").attr("src", base64).on('load', function() {
        context.scale(width/this.width,  height/this.height);
        context.drawImage(this, 0, 0); 
        deferred.resolve($("<img/>").attr("src", canvas.toDataURL()));               
    });
    
    return deferred.promise();    
}