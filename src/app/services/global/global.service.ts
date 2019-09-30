import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SocketService } from './socket.service';
import { LoginService } from '../welcome/login.service';

import { PERMISSION } from '../../enums/enums';

declare let $: any;
declare let jQuery: any;
const defaultProfileImagePath: string = "/assets/images/default_profile_img.jpg";

@Injectable()
export class GlobalService extends LoginService {

    // Use this property for property binding    
    userId: string;
    userProfileImage: string;
    userPermissions: Array<string>;
    defaultProfileImage: string;

    constructor(public http: HttpClient,
        private socketService: SocketService) {
        super(http);

        // Close modal when click back on browser.
        $(window).on('popstate', function () {
            let modalElement = $(".modal");

            if (modalElement.length > 0) {
                modalElement.modal("hide");
            }
        });

        // Add jQuery function to find if element has scroll bar.
        (function ($) {
            $.fn.hasScrollBar = function () {
                return this.get(0).scrollHeight > this.get(0).clientHeight;
            }
        })(jQuery);

        // Initialize variables
        this.userPermissions = [];
        this.defaultProfileImage = defaultProfileImagePath;

        this.ImageToBase64(defaultProfileImagePath, (imgBase64: string) => {
            this.defaultProfileImage = imgBase64;
        });
    }

    Initialize() {
        if (!this.socketService.IsSocketExists()) {
            this.socketService.Initialize();

            super.GetUserPermissions().then((result) => {
                this.userPermissions = result || [];
            });
        }
    }

    IsUserHasAdminPermission() {
        return (this.userPermissions.indexOf(PERMISSION.ADMIN) != -1);
    }

    IsUserHasMasterPermission() {
        return (this.userPermissions.indexOf(PERMISSION.MASTER) != -1);
    }

    IsUserHasRootPermission() {
        return (this.IsUserHasAdminPermission() || this.IsUserHasMasterPermission());
    }

    ResetGlobalVariables() {
        this.socketService.DeleteSocket();
        this.userProfileImage = null;
        this.userPermissions = [];
    }

    ImageToBase64(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }
}