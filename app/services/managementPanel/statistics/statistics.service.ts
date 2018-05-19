import { BasicService } from '../../basic/basic.service';

import { STATISTICS_RANGE, LOG_TYPE } from '../../../enums/enums';

export class StatisticsService extends BasicService {

    prefix = "/api/statistics";

    GetLoginsData(logType: LOG_TYPE, range: STATISTICS_RANGE, email?: string) {
        var parameters: string = "logType=" + logType + "&range=" + range;
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