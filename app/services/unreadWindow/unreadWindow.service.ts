import { BasicService } from '../basic/basic.service';

export class UnreadWindowService extends BasicService {

    prefix = "/api/unreadWindow";

    GetAllChats() {
        return super.get(this.prefix + '/getAllChats')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }
}