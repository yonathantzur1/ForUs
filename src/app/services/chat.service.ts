import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ChatService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/chat");
    }

    GetChat(idsArray: Array<string>) {
        let details = { "members": idsArray };

        return super.post('/getChat', details);
    }

    GetChatPage(idsArray: Array<string>, currMessagesNum: number, totalMessagesNum: number) {
        let details = { "members": idsArray, currMessagesNum, totalMessagesNum };

        return super.post('/getChatPage', details);
    }

    GetAllPreviewChats() {
        return super.get('/getAllPreviewChats');
    }
}