import { Component, OnDestroy } from '@angular/core';

import { PermissionsCardService } from '../../../../services/managementPanel/management/permissionsCard/permissionsCard.service';
import { GlobalService } from '../../../../services/global/global.service';
import { SnackbarService } from '../../../../services/snackbar/snackbar.service';

declare var $: any;

@Component({
    selector: 'permissionsCard',
    templateUrl: './permissionsCard.html',
    providers: [PermissionsCardService]
})

export class PermissionsCardComponent implements OnDestroy {

    permissions: Array<any> = [];
    isLoading: boolean;
    user: any;

    subscribeObj: any;

    constructor(private globalService: GlobalService,
        private snackbarService: SnackbarService,
        private permissionsCardService: PermissionsCardService) {
        this.subscribeObj = this.globalService.data.subscribe((value: any) => {
            if (value["isOpenPermissionsCard"]) {
                this.user = value["isOpenPermissionsCard"];

                this.isLoading = true;
                permissionsCardService.GetUserPermissions(this.user._id).then((result: any) => {
                    this.isLoading = false;

                    if (result) {
                        this.permissions.forEach((permission: any) => {
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
            }
        });

        this.isLoading = true;
        permissionsCardService.GetAllPermissions().then((result: any) => {
            this.isLoading = false;

            if (result) {
                this.permissions = result;
            }
        });
    }

    ngOnDestroy() {
        this.subscribeObj.unsubscribe();
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