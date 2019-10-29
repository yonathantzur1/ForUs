import { Component, OnDestroy } from '@angular/core';

import { PermissionsCardService } from '../../../../services/managementPanel/management/permissionsCard.service';
import { EventService } from '../../../../services/global/event.service';
import { SnackbarService } from '../../../../services/global/snackbar.service';

declare let $: any;

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

    constructor(private eventService: EventService,
        public snackbarService: SnackbarService,
        private permissionsCardService: PermissionsCardService) {
        let self = this;

        //#region events
        eventService.Register("openPermissionsCard", (user: any) => {
            self.user = user;

            self.isLoading = true;
            permissionsCardService.GetUserPermissions(self.user._id).then((result: any) => {
                self.isLoading = false;

                if (result) {
                    self.permissions.forEach((permission: any) => {
                        permission.isChecked = result.includes(permission.type);
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
        let currentState = permission.isChecked;

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