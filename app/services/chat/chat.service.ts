import { BasicService } from '../basic/basic.service';

export class ChatService extends BasicService {

    prefix = "/api/chat";

    GetChat(idsArray: Array<string>) {
        var details = { "membersIds": idsArray };

        return super.post(this.prefix + '/getChat', JSON.stringify(details))
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((result: any) => {
                return null;
            });
    }
}