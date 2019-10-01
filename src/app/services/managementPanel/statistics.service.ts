import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { STATISTICS_RANGE, LOG_TYPE } from '../../enums/enums';

@Injectable()
export class StatisticsService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/statistics");
    }

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

        return super.post('/getChartData', data)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetUserByEmail(email: string) {
        return super.get('/getUserByEmail?email=' + email)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}