import { BasicService } from '../basic/basic.service';

export class HomeService extends BasicService {
    prefix = "/api/home";

    SaveUserLocation(xCord: number, yCord: number) {
        var location = { xCord, yCord };
        return super.put(this.prefix + '/saveUserLocation', JSON.stringify(location))
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}