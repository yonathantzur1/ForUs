import { BasicService } from '../basic/basic.service';

export class ChatService extends BasicService {

    prefix = "/api/chat";

    GetChat(idsArray: Array<string>) {
        var details = { "membersIds": idsArray };

        return super.post(this.prefix + '/getChat', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetChatPage(idsArray: Array<string>, currMessagesNum: number, totalMessagesNum: number) {
        var details = { "membersIds": idsArray, currMessagesNum, totalMessagesNum };

        return super.post(this.prefix + '/getChatPage', details)
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetAllPreviewChats() {
        return super.get(this.prefix + '/getAllPreviewChats')
            .toPromise()
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}