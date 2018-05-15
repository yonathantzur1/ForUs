import { Component, OnDestroy } from '@angular/core';

import { PermissionsCardService } from '../../../../services/management/permissionsCard/permissionsCard.service';
import { GlobalService } from '../../../../services/global/global.service';
import { AlertService } from '../../../../services/alert/alert.service';

declare var $: any;
declare var snackbar: Function;

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
                snackbar("עדכון ההרשאות בוצע בהצלחה");
            }
            else {
                snackbar("שגיאה בעדכון ההרשאות");
            }
        });
    }
}