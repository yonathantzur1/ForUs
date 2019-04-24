import { Component, OnDestroy } from '@angular/core';

import { PermissionsCardService } from '../../../../services/managementPanel/management/permissionsCard/permissionsCard.service';
import { GlobalService } from '../../../../services/global/global.service';
import { EventService } from '../../../../services/event/event.service';
import { SnackbarService } from '../../../../services/snackbar/snackbar.service';

declare var $: any;

@Component({
    selector: 'permissionsCard',
    templateUrl: './permissionsCard.html',
    providers: [PermissionsCardService],
    styleUrls: ['./permissionsCard.css']
})

export class PermissionsCardComponent implements OnDestroy {

    permissions: Array<any> = [];
    isLoading: boolean;
    user: any;

    eventsIds: Array<string> = [];

    constructor(public globalService: GlobalService,
        private eventService: EventService,
        public snackbarService: SnackbarService,
        private permissionsCardService: PermissionsCardService) {
        var self = this;

        //#region events
        eventService.Register("openPermissionsCard", (user: any) => {
            self.user = user;

            self.isLoading = true;
            permissionsCardService.GetUserPermissions(self.user._id).then((result: any) => {
                self.isLoading = false;

                if (result) {
                    self.permissions.forEach((permission: any) => {
                        if (result.indexOf(permission.type) != -1) {
                            permission.isChecked = true;
                        }
                        else {
                            permission.isChecked = false;
                        }
                    });
                }
            });

            $("#permissions-modal").modal('show');
        }, self.eventsIds);
        //#endregion

        self.isLoading = true;

        permissionsCardService.GetAllPermissions().then((result: any) => {
            self.isLoading = false;

            if (result) {
                self.permissions = result;
            }
        });
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    }

    CheckPermission(permission: any) {
        var currentState = permission.isChecked;

        this.permissions.forEach((perm: any) => {
            perm.isChecked = false;
        });

        permission.isChecked = !currentState;
    }

    UpdatePermissions() {
        this.isLoading = true;
        this.permissionsCardService.UpdatePermissions(this.user._id, this.permissions).then((result: any) => {
            this.isLoading = false;
            $("#permissions-modal").modal('hide');

            if (result) {
                this.snackbarService.Snackbar("עדכון ההרשאות בוצע בהצלחה");
            }
            else {
                this.snackbarService.Snackbar("שגיאה בעדכון ההרשאות");
            }
        });
    }
}