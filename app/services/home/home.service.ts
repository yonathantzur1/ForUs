import { BasicService } from '../basic/basic.service';
import { LOCATION_ERROR } from '../../enums/enums'

export class HomeService extends BasicService {
    prefix = "/api/home";

    SaveUserLocation(xCord: number, yCord: number) {
        var location = { xCord, yCord };

        return super.put(this.prefix + '/saveUserLocation', location)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    SaveUserLocationError(error: LOCATION_ERROR) {
        var details = { error };

        return super.put(this.prefix + '/saveUserLocationError', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}