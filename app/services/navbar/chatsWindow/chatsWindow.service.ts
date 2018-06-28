import { BasicService } from '../../basic/basic.service';

export class ChatsWindowService extends BasicService {

    prefix = "/api/chatsWindow";

    GetAllChats() {
        return super.get(this.prefix + '/getAllChats')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}