import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { LoginService } from '../login/login.service';

declare var io: any;
declare function deleteCookieByName(name: string): void;

export enum PERMISSION {
    ADMIN = "admin"
}

export class GlobalService extends LoginService {

    // Use this property for property binding
    public data: BehaviorSubject<boolean> = new BehaviorSubject<any>({});
    public socket: any;
    public socketOnDictionary: any = {};
    public userProfileImage: string;
    public userPermissions: Array<string> = [];
    public defaultProfileImage: string = "./app/components/profilePicture/pictures/empty-profile.png";

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

    // This function should be called in order to refresh
    // the client cookies (token) that the socket object contains.
    RefreshSocket() {
        this.socket && this.socket.destroy();
        this.socket = io();
        this.socket.emit('login');

        var self = this;

        // Listen to all socket events on the new socket object.
        Object.keys(self.socketOnDictionary).forEach((name: string) => {
            self.socket.on(name, self.socketOnDictionary[name]);
        });
    }

    SocketOn(name: string, func: Function) {
        this.socketOnDictionary[name] = func;
        this.socket.on(name, func);
    }

    Logout() {
        deleteCookieByName("uid");
        this.DeleteTokenFromCookie().then((result: any) => { });
        this.ResetGlobalVariables();
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