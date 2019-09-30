import { BasicService } from '../basic.service';

import { STATISTICS_RANGE, LOG_TYPE } from '../../enums/enums';

export class StatisticsService extends BasicService {

    prefix = "/api/statistics";

    GetChartData(logType: LOG_TYPE,
        range: STATISTICS_RANGE,
        datesRange: Object,
        clientTimeZone: number,
        email: string) {
        let data = {
            logType,
            range,
            datesRange,
            clientTimeZone,
            email
        }

        return super.post(this.prefix + '/getChartData', data)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetUserByEmail(email: string) {
        return super.get(this.prefix + '/getUserByEmail?email=' + email)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}