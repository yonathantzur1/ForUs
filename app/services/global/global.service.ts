import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { LoginService } from '../login/login.service';

declare var io: any;

export enum PERMISSIONS {
    ADMIN = "admin"
}

export class GlobalService extends LoginService {

    // Use this property for property binding
    public data: BehaviorSubject<boolean> = new BehaviorSubject<any>({});
    public socket: any;
    public userProfileImage: string;
    public userPermissions: Array<string> = [];

    Initialize() {
        if (!this.socket) {
            this.socket = io();
            super.UpdateLastLogin();

            var self = this;
            super.GetUserPermissions().then(function (result) {
                result && (self.userPermissions = result);
            });
        }
    }

    ResetGlobalVariables() {
        this.socket && this.socket.destroy();
        this.socket = null;
        this.data = new BehaviorSubject<any>({});
        this.userProfileImage = null;
        this.userPermissions = [];
    }

    setData(key: string, value: any) {
        var currData: any = this.data.value;
        currData = {};
        currData[key] = value;

        this.data.next(currData);
    }

    setMultiData(array: Array<any>) {
        var currData: any = this.data.value;
        currData = {};

        array.forEach(element => {
            currData[element.key] = element.value;
        });

        this.data.next(currData);
    }
}