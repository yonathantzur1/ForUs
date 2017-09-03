import { BasicService } from '../basic/basic.service';

export class ChatService extends BasicService {

    prefix = "/api/chat";

    GetChat(idsArray: Array<string>, token: any) {
        var details = { "membersIds": idsArray, "token": token };

        return super.post(this.prefix + '/getChat', JSON.stringify(details))
            .toPromise()
            .then((result) => {
                return result.json();
            })
            .catch((result) => {
                return null;
            });
    }
}