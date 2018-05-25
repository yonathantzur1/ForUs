import { Observable, BehaviorSubject } from 'rxjs';

import { LoginService } from '../login/login.service';
import { EmptyProfile } from '../../pictures/empty-profile';

import { PERMISSION } from '../../enums/enums';

declare var io: any;
declare function deleteCookieByName(name: string): void;

export class GlobalService extends LoginService {

    // Use this property for property binding
    public data: BehaviorSubject<boolean> = new BehaviorSubject<any>({});
    public socket: any;
    public socketOnDictionary: any = {};
    public userProfileImage: string;
    public userPermissions: Array<string> = [];
    public defaultProfileImage: string = EmptyProfile;
    public uidCookieName: string = "uid";

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

    IsUserHasMasterPermission() {
        return (this.userPermissions.indexOf(PERMISSION.MASTER) != -1);
    }

    IsUserHasRootPermission() {
        return ((this.userPermissions.indexOf(PERMISSION.MASTER) != -1) ||
            (this.userPermissions.indexOf(PERMISSION.ADMIN) != -1));
    }

    // Emit socket event before initialize the socket object.
    CallSocketFunction(funcName: string, obj?: any) {
        if (!this.socket) {
            io().emit(funcName, obj);
        }
        else {
            this.socket.emit(funcName, obj);
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
        if (this.socket) {
            this.socket.disconnect();
            this.socket.connect();
            this.socket.emit('login');
        }
    }

    SocketOn(name: string, func: Function) {
        this.socketOnDictionary[name] = func;
        this.socket.on(name, func);
    }

    Logout() {
        deleteCookieByName(this.uidCookieName);
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