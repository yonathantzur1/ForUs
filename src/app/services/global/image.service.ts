const defaultProfileImagePath: string = "/assets/images/default_profile_img.jpg";

export class ImageService {
    userProfileImage: string;
    defaultProfileImage: string;

    constructor() {
        this.defaultProfileImage = defaultProfileImagePath;

        this.ImageToBase64(defaultProfileImagePath, (imgBase64: string) => {
            this.defaultProfileImage = imgBase64;
        });
    }

    private ImageToBase64(url: string, callback: Function) {
        let xhr = new XMLHttpRequest();
        xhr.onload = () => {
            var reader = new FileReader();
            reader.onloadend = () => {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

    DeleteUserProfileImage() {
        this.userProfileImage = null;
    }
}