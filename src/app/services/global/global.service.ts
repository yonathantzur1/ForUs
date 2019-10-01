import { Injectable } from '@angular/core';

import { SocketService } from './socket.service';
import { PermissionsService } from './permissions.service';
import { ImageService } from './image.service';

declare let $: any;
declare let jQuery: any;

@Injectable()
export class GlobalService {
    userId: string;

    constructor(private socketService: SocketService,
        private permissionsService: PermissionsService,
        private imageService: ImageService) {

        // Close modal when click back on browser.
        $(window).on('popstate', function () {
            let modalElement = $(".modal");

            if (modalElement.length > 0) {
                modalElement.modal("hide");
            }
        });

        // Add jQuery function to find if element has scroll bar.
        (($) => {
            $.fn.hasScrollBar = function () {
                return this.get(0).scrollHeight > this.get(0).clientHeight;
            }
        })(jQuery);
    }

    Initialize() {
        if (!this.socketService.IsSocketExists()) {
            this.socketService.Initialize();
            this.permissionsService.Initialize();
        }
    }

    ResetGlobalVariables() {
        this.socketService.DeleteSocket();
        this.permissionsService.DeletePermissions();
        this.imageService.DeleteUserProfileImage();
        this.userId = null;
    }
}