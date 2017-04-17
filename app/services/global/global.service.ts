import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class GlobalService {
    // use this property for property binding
    public data: BehaviorSubject<boolean> = new BehaviorSubject<any>({});

    setData(key: string, value: any) {
        var currData = this.data.value;
        currData[key] = value;

        this.data.next(currData);
    }

    setMultiData(array: Array<any>) {
        var currData = this.data.value;

        array.forEach(element => {
            currData[element.key] = element.value;
        });

        this.data.next(currData);
    }

    deleteData(key: string) {
        var currData = this.data.value;
        delete currData[key];
    }

    deleteMultiData(array: Array<string>) {
        if (array.length != 0) {
            var currData = this.data.value;

            array.forEach(key => {
                delete currData[key]
            });
        }
    }
}