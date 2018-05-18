import { BasicService } from '../../basic/basic.service';

export class StatisticsService extends BasicService {

    prefix = "/api/statistics";

    GetLoginsData(range: string, email?: string) {
        var parameters: string = "range=" + range;
        email && (parameters += "&email=" + email);
        return super.get(this.prefix + '/getLoginsData?' + parameters)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

}