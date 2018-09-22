import { BasicService } from '../../basic/basic.service';

export class UserReportWindowService extends BasicService {

    prefix = "/api/userReportWindow";

    GetAllReportReasons() {        
        return super.get(this.prefix + '/getAllReportReasons')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}