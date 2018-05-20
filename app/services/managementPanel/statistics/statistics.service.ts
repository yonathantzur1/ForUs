import { BasicService } from '../../basic/basic.service';

import { STATISTICS_RANGE, LOG_TYPE } from '../../../enums/enums';

export class StatisticsService extends BasicService {

    prefix = "/api/statistics";

    GetChartData(logType: LOG_TYPE, range: STATISTICS_RANGE, datesRange: Object, email?: string) {
        var data = {
            logType,
            range,
            datesRange,
            email
        }
        
        return super.post(this.prefix + '/getChartData', data)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }

}