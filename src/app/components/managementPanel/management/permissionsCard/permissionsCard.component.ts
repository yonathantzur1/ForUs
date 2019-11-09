import { Component, OnDestroy } from '@angular/core';

import { PermissionsCardService } from '../../../../services/managementPanel/management/permissionsCard.service';
import { EventService, EVENT_TYPE } from '../../../../services/global/event.service';
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

        eventService.register(EVENT_TYPE.openPermissionsCard, (user: any) => {
            self.user = user;

            self.isLoading = true;
            permissionsCardService.getUserPermissions(self.user._id).then((result: any) => {
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

        permissionsCardService.getAllPermissions().then((result: any) => {
            self.isLoading = false;

            if (result) {
                self.permissions = result;
            }
        });
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    checkPermission(permission: any) {
        let currentState = permission.isChecked;

        this.permissions.forEach((perm: any) => {
            perm.isChecked = false;
        });

        permission.isChecked = !currentState;
    }

    updatePermissions() {
        this.isLoading = true;
        this.permissionsCardService.updatePermissions(this.user._id, this.permissions).then((result: any) => {
            this.isLoading = false;
            $("#permissions-modal").modal('hide');

            if (result) {
                this.snackbarService.snackbar("עדכון ההרשאות בוצע בהצלחה");
            }
            else {
                this.snackbarService.snackbar("שגיאה בעדכון ההרשאות");
            }
        });
    }
}