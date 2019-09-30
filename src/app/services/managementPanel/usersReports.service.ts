import { BasicService } from '../basic.service';

export class UsersReportsService extends BasicService {
    prefix = "/api/usersReports";

    GetAllReports() {
        return super.get(this.prefix + '/getAllReports')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}