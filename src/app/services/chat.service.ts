import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ChatService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/chat");
    }

    GetChat(idsArray: Array<string>) {
        let details = { "membersIds": idsArray };

        return super.post('/getChat', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetChatPage(idsArray: Array<string>, currMessagesNum: number, totalMessagesNum: number) {
        let details = { "membersIds": idsArray, currMessagesNum, totalMessagesNum };

        return super.post('/getChatPage', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

    GetAllPreviewChats() {
        return super.get('/getAllPreviewChats')
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }
}