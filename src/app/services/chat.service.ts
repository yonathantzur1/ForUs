import { BasicService } from './basic.service';

export class ChatService extends BasicService {

    prefix = "/api/chat";

    GetChat(idsArray: Array<string>) {
        let details = { "membersIds": idsArray };

        return super.post(this.prefix + '/getChat', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetChatPage(idsArray: Array<string>, currMessagesNum: number, totalMessagesNum: number) {
        let details = { "membersIds": idsArray, currMessagesNum, totalMessagesNum };

        return super.post(this.prefix + '/getChatPage', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetAllPreviewChats() {
        return super.get(this.prefix + '/getAllPreviewChats')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}