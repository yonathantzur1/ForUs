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

    ReportUser(reportedUserId: string, reasonId: string, reasonDetails: string) {
        var data = { reportedUserId, reasonId, reasonDetails };

        return super.post(this.prefix + '/reportUser', data)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}