import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

declare var io: any;

export class GlobalService {
    // use this property for property binding
    public data: BehaviorSubject<boolean> = new BehaviorSubject<any>({});
    public socket: any;
    public userProfileImage: string;

    InitializeSocket() {
        if (!this.socket) {
            this.socket = io();
        }
    }

    ResetGlobalVariables() {
        this.socket && this.socket.destroy();
        this.socket = null;
        this.data = new BehaviorSubject<any>({});
        this.userProfileImage = null;
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