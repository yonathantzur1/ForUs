import { Component, OnInit, OnDestroy, Input, AfterViewChecked } from '@angular/core';

import { ChatService } from '../../services/chat.service';
import { SocketService } from '../../services/global/socket.service';
import { DateService } from '../../services/global/date.service';
import { EventService, EVENT_TYPE } from '../../services/global/event.service';
import { SnackbarService } from '../../services/global/snackbar.service';
import { ImageService } from 'src/app/services/global/image.service';

export class TopIcon {
    id: string;
    class: string;
    innerIconText: string;
    title: string;
    isSelected: boolean;
    onClick: Function;
}

export class CanvasTopIcon {
    icon: string;
    title: string;
    onClick: Function;
}

declare let $: any;
declare let window: any;
declare let loadImage: any;

@Component({
    selector: 'chat',
    templateUrl: './chat.html',
    providers: [ChatService],
    styleUrls: ['./chat.css']
})

export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
    @Input() chatData: any;
    @Input() getFriendById: Function;
    @Input() openChat: Function;
    isChatLoadingError: boolean;
    msghInput: string;
    messages: Array<any>;
    isAllowScrollDown: boolean;
    totalMessagesNum: number;
    isMessagesLoading: boolean;
    isMessagesPageLoading: boolean;
    lastPageMessageId: string;
    chatBodyScrollHeight: number = 0;
    topIcons: Array<TopIcon>;

    //#region unread messages line sector properties

    isAllowShowUnreadLine: boolean;
    unreadMessagesNumber: number;

    //#endregion

    //#region chat notification properties

    isShowMessageNotification: boolean;
    isSelfMessageNotification: boolean;
    messageNotificationText: string;
    messageNotificationFriendObj: any;
    messageNotificationDelay: number = 3800; // milliseconds
    messageNotificationInterval: any;

    //#endregion

    //#region cavas sector properties

    isCanvasInitialize: boolean;
    canvas: any;
    ctx: any;
    canvasTopBar: any;
    drawing: boolean;
    mousePos: any;
    lastPos: any;
    colorBtns: Array<string>;
    isCanvasEmpty: boolean;
    canvasSelectedColorIndex: number;
    isCanvasTopOpen: boolean;
    canvasTopIcons: Array<CanvasTopIcon>;
    undoArray: Array<string>;
    canvasEvents: any;
    CanvasResizeFunc: any;

    //#endregion

    eventsIds: Array<string> = [];

    constructor(private chatService: ChatService,
        public snackbarService: SnackbarService,
        public imageService: ImageService,
        private socketService: SocketService,
        private dateService: DateService,
        private eventService: EventService) {

        let self = this;

        //#region events

        eventService.register(EVENT_TYPE.setChatData, (chatData: any) => {
            self.chatData = chatData;
            self.initializeChat();
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.moveToChatWindow, () => {
            self.selectTopIcon(self.getTopIconById("chat"));
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.closeChat, () => {
            self.closeChat();
        }, self.eventsIds);

        //#endregion

        self.topIcons = [
            {
                id: "chat",
                class: "material-icons top-chat-icon",
                innerIconText: "chat",
                title: "צ'אט",
                isSelected: true,
                onClick: function () {
                    self.selectTopIcon(this);
                }
            },
            {
                id: "canvas",
                class: "material-icons top-canvas-icon",
                innerIconText: "brush",
                title: "צייר",
                isSelected: false,
                onClick: function () {
                    self.isAllowShowUnreadLine = false;
                    self.hideCanvasTopSector();
                    self.selectTopIcon(this);
                }
            }
        ];

        self.canvasTopIcons = [
            {
                icon: "add_a_photo",
                title: "העלאת תמונה",
                onClick: function () {
                    $("#chatImage").trigger("click");
                }
            },
            {
                icon: "undo",
                title: "ביטול",
                onClick: function () {
                    self.undoArray.pop();

                    if (self.undoArray.length > 0) {
                        let image = new Image;
                        image.src = self.undoArray[self.undoArray.length - 1];

                        image.onload = function () {
                            self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
                            self.ctx.drawImage(image, 0, 0);
                            self.isCanvasEmpty = false;
                        }
                    }
                    else {
                        self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
                        self.isCanvasEmpty = true;
                    }

                    self.ctx.strokeStyle = self.colorBtns[self.canvasSelectedColorIndex];
                }
            },
            {
                icon: "delete_forever",
                title: "איפוס",
                onClick: function () {
                    if (!self.isCanvasEmpty) {
                        self.undoArray.push(self.canvas.toDataURL());
                    }

                    self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
                    self.isCanvasEmpty = true;
                }
            }
        ];

        self.colorBtns = ["#211A1E", "#C3423F", "#9BC53D", "#2BC016",
            "#5BC0EB", "#F9C22E", "#3f51b5", "#6f0891",
            "#cf56d7", "#DAA49A", "#ff5722", "#D62839"];
        self.isCanvasInitialize = false;
        self.isCanvasTopOpen = false;
    }

    ngOnInit() {
        let self = this;

        self.socketService.socketOn('GetMessage', function (msgData: any) {
            if (msgData.from == self.chatData.friend._id) {
                self.addMessageToChat(msgData);
            }
            else {
                self.showChatNotification(msgData, false);
            }
        });

        self.initializeCanvas();

        self.canvasEvents = {
            "mousedown": function (e: any) {
                self.drawing = true;
                self.lastPos = self.getMousePos(self.canvas, e);
                self.ctx.fillStyle = self.colorBtns[self.canvasSelectedColorIndex];
                self.ctx.fillRect(self.lastPos.x, self.lastPos.y, 1, 1);
                self.hideCanvasTopSector();

                if (self.isCanvasEmpty) {
                    self.isCanvasEmpty = false;
                    self.undoArray = [];
                }
            },
            "mouseup": function (e: any) {
                self.drawing = false;
                self.undoArray.push(self.canvas.toDataURL());
            },
            "mousemove": function (e: any) {
                self.mousePos = self.getMousePos(self.canvas, e);
            },
            "mouseout": function (e: any) {
                if (self.drawing) {
                    self.undoArray.push(self.canvas.toDataURL());
                }

                self.drawing = false;
            },
            "touchstart": function (e: any) {
                e.preventDefault();
                e.stopPropagation()
                self.mousePos = self.getTouchPosition(self.canvas, e);
                let touch = e.touches[0];
                let mouseEvent = new MouseEvent("mousedown", {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                self.canvas.dispatchEvent(mouseEvent);
            },
            "touchend": function (e: any) {
                e.preventDefault();
                e.stopPropagation()
                let mouseEvent = new MouseEvent("mouseup", {});
                self.canvas.dispatchEvent(mouseEvent);
            },
            "touchmove": function (e: any) {
                e.preventDefault();
                e.stopPropagation()
                let touch = e.touches[0];
                let mouseEvent = new MouseEvent("mousemove", {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                self.canvas.dispatchEvent(mouseEvent);
            }
        };

        Object.keys(self.canvasEvents).forEach(key => {
            self.canvas.addEventListener(key, self.canvasEvents[key], false);
        });

        self.CanvasResizeFunc = function () {
            let image = new Image;
            image.src = self.canvas.toDataURL();

            let canvasContainer = document.getElementById("canvas-body-sector");
            self.canvas.width = canvasContainer.offsetWidth;
            self.canvas.height = canvasContainer.offsetHeight;


            image.onload = function () {
                self.ctx.drawImage(image, 0, 0)
            }

            self.ctx.strokeStyle = self.colorBtns[self.canvasSelectedColorIndex];
        };

        window.addEventListener("resize", self.CanvasResizeFunc);

        // Get a regular interval for drawing to the screen
        window.requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimaitonFrame ||
                function (callback: any) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();

        // Allow for animation
        (function drawLoop() {
            window.requestAnimFrame(drawLoop);
            self.renderCanvas();
        })();
    }

    ngOnDestroy() {
        let self = this;

        self.eventService.unsubscribeEvents(self.eventsIds);

        Object.keys(self.canvasEvents).forEach(key => {
            self.canvas.removeEventListener(key, self.canvasEvents[key], false);
        });

        window.removeEventListener("resize", self.CanvasResizeFunc);

        self.isCanvasInitialize = false;
    }

    ngAfterViewChecked() {
        if ($("#chat-body-sector")[0].scrollHeight != this.chatBodyScrollHeight && this.isAllowScrollDown) {
            this.scrollToBottom();
            this.chatBodyScrollHeight = $("#chat-body-sector")[0].scrollHeight;
        }

        if (this.getTopIconById("canvas").isSelected &&
            this.canvas &&
            (this.canvas.width == 0 || this.canvas.height == 0)) {
            this.initializeCanvas();
        }
    }

    initializeChat() {
        if (this.isCanvasInitialize) {
            this.selectTopIcon(this.getTopIconById("chat"));
            this.initializeCanvas();
        }

        this.messages = [];
        this.msghInput = '';
        this.isAllowScrollDown = true;
        this.isAllowShowUnreadLine = true;
        this.chatBodyScrollHeight = 0;
        this.isMessagesLoading = true
        this.isChatLoadingError = false;

        this.chatService.getChat([this.chatData.user._id, this.chatData.friend._id]).then((chat: any) => {
            if (chat) {
                this.messages = chat.messages;
                this.totalMessagesNum = chat.totalMessagesNum;

                let chatBodySectorElement = $("#chat-body-sector");

                if (chatBodySectorElement && chatBodySectorElement.length > 0) {
                    chatBodySectorElement[0].removeEventListener("scroll", this.chatScrollTopFunc.bind(this));
                }

                (this.messages.length < this.totalMessagesNum) && chatBodySectorElement[0].addEventListener("scroll", this.chatScrollTopFunc.bind(this));
            }
            else if (chat == null) {
                this.isChatLoadingError = true;
            }

            this.isMessagesLoading = false;
            $("#msg-input").focus();
        });
    }

    addMessageToChat(msgData) {
        this.isAllowScrollDown = true;
        this.chatData.friend.isTyping = false;
        this.messages.push(msgData);

        // In case the chat is on canvas mode.
        if (this.getTopIconById("canvas").isSelected) {
            this.showChatNotification(msgData, true);
        }
    }

    closeChat() {
        this.chatData.isOpen = false;
    }

    sendMessage() {
        if (!this.isMessagesLoading && this.msghInput) {
            // Delete spaces from the start and the end of the message text.
            this.msghInput = this.msghInput.trim();

            if (this.msghInput) {
                let msgData = {
                    "from": this.chatData.user._id,
                    "to": this.chatData.friend._id,
                    "text": this.msghInput,
                    "time": new Date()
                };

                this.msghInput = '';
                this.isAllowScrollDown = true;
                this.isAllowShowUnreadLine = false;
                this.messages.push(msgData);
                $("#msg-input").focus();
                this.socketService.socketEmit("sendMessage", msgData);
            }
        }
    }

    msgInputKeyup(event: any) {
        // In case of pressing ENTER.
        if (event.key == "Enter" || event.key == "NumpadEnter") {
            this.sendMessage();
        }
        // In case of pressing ESCAPE.
        else if (event.keyCode == 27) {
            this.closeChat();
        }
        else {
            this.socketService.socketEmit("ServerFriendTyping", this.chatData.friend._id);
        }
    }

    scrollToBottom() {
        $("#chat-body-sector")[0].scrollTop = $("#chat-body-sector")[0].scrollHeight;
    }

    getTimeString(date: Date) {
        let localDate = new Date(date);

        let HH = localDate.getHours().toString();
        let mm = localDate.getMinutes().toString();

        if (mm.length == 1) {
            mm = "0" + mm;
        }

        return (HH + ":" + mm);
    }

    isShowUnreadLine(msgFromId: string, msgId: string, msgIndex: number) {
        let friendMessagesNotifications = this.chatData.messagesNotifications[msgFromId];

        if (this.isAllowShowUnreadLine &&
            friendMessagesNotifications &&
            msgId == friendMessagesNotifications.firstUnreadMessageId &&
            msgIndex != 0) {
            this.unreadMessagesNumber = friendMessagesNotifications.unreadMessagesNumber;

            return true;
        }
        else {
            return false;
        }
    }

    getUnreadMessagesNumberText(unreadMessagesNumber: number) {
        if (unreadMessagesNumber == 1) {
            return ("הודעה 1 שלא נקראה");
        }
        else {
            return (unreadMessagesNumber + " הודעות שלא נקראו");
        }
    }

    isShowDateBubble(index: number) {
        if (index > 0) {
            let currMessageDate = new Date(this.messages[index].time);
            let beforeMessageDate = new Date(this.messages[index - 1].time);

            if (currMessageDate.getDate() != beforeMessageDate.getDate() ||
                currMessageDate.getMonth() != beforeMessageDate.getMonth() ||
                currMessageDate.getFullYear() != beforeMessageDate.getFullYear()) {
                return true;
            }
        }
        else if (index == 0) {
            return true;
        }
        else {
            return false;
        }
    }

    getDateBubbleText(index: number) {
        return this.dateService.
            getDateDetailsString(new Date(this.messages[index].time), new Date(), false);
    }

    getTopIconById(id: string): TopIcon {
        for (let i = 0; i < this.topIcons.length; i++) {
            if (this.topIcons[i].id == id) {
                return this.topIcons[i];
            }
        }

        return null;
    }

    selectTopIcon(iconObj: any) {
        this.topIcons.forEach((obj: TopIcon) => {
            obj.isSelected = false;
        });

        iconObj.isSelected = true;
    }

    initializeCanvas() {
        this.canvas = document.getElementById("sig-canvas");
        this.canvasTopBar = document.getElementById("canvas-top-bar-sector");
        let canvasContainer = document.getElementById("canvas-body-sector");
        this.canvas.width = canvasContainer.offsetWidth;
        this.canvas.height = canvasContainer.offsetHeight;
        this.ctx = this.canvas.getContext("2d");
        this.canvasSelectedColorIndex = 0;
        this.ctx.strokeStyle = this.colorBtns[0];
        this.ctx.lineWith = 4;

        this.drawing = false;
        this.mousePos = { x: 0, y: 0 };
        this.lastPos = this.mousePos;
        this.isCanvasInitialize = true;
        this.isCanvasEmpty = true;
        this.undoArray = [];
    }

    // Get the position of the mouse relative to the canvas
    getMousePos(canvasDom: any, mouseEvent: any) {
        let rect = canvasDom.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - rect.left,
            y: mouseEvent.clientY - rect.top
        };
    }

    renderCanvas() {
        if (this.drawing) {
            let offset = $("#sig-canvas").offset();
            this.ctx.moveTo(this.lastPos.x - offset.left, this.lastPos.y);
            this.ctx.lineTo(this.mousePos.x - offset.left, this.mousePos.y);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.lastPos = this.mousePos;
        }
    }

    // Get the position of a touch relative to the canvas
    getTouchPosition(canvasDom: any, touchEvent: any) {
        let rect = canvasDom.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        };
    }

    changeCanvasColor(colorIndex: number) {
        this.canvasSelectedColorIndex = colorIndex;
        this.ctx.strokeStyle = this.colorBtns[colorIndex];
    }

    sendCanvas() {
        if (!this.isMessagesLoading && !this.isCanvasEmpty) {
            let imageBase64 = this.canvas.toDataURL();
            this.initializeCanvas();
            this.selectTopIcon(this.getTopIconById("chat"));

            let msgData = {
                "from": this.chatData.user._id,
                "to": this.chatData.friend._id,
                "text": imageBase64,
                "isImage": true,
                "time": new Date()
            };

            this.isAllowScrollDown = true;
            this.messages.push(msgData);
            this.socketService.socketEmit("sendMessage", msgData);
        }
    }

    showHideCanvasTopSector() {
        if (this.isCanvasTopOpen) {
            this.canvasTopBar.style.bottom = "0px";
        }
        else {
            this.canvasTopBar.style.bottom = "40px";
        }

        this.isCanvasTopOpen = !this.isCanvasTopOpen;
    }

    hideCanvasTopSector() {
        if (this.isCanvasTopOpen) {
            this.canvasTopBar.style.bottom = "0px";
            this.isCanvasTopOpen = false;
        }
    }

    uploadImage() {
        let self = this;
        let URL = window.URL;
        let $chatImage: any = $('#chatImage');

        if (URL) {
            let files = $chatImage[0].files;
            let file;

            if (files && files.length) {
                file = files[0];

                if (/^image\/\w+$/.test(file.type)) {
                    loadImage(
                        file,
                        function (img: any) {
                            self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
                            self.ctx.drawImage(img,
                                (self.canvas.width - img.width) / 2,
                                (self.canvas.height - img.height) / 2);
                            self.undoArray.push(self.canvas.toDataURL());
                            self.isCanvasEmpty = false;
                        },
                        {
                            maxWidth: self.canvas.width,
                            maxHeight: self.canvas.height,
                            canvas: true,
                            orientation: true,
                        });

                    $chatImage.val('');
                    self.hideCanvasTopSector();

                    return true;
                }
                else {
                    return false;
                }
            }
        }

        return null;
    }

    changeImage() {
        let isSuccess = this.uploadImage();

        if (isSuccess == false) {
            this.snackbarService.snackbar("הקובץ שנבחר אינו תמונה");
        }
        else if (isSuccess == null) {
            this.snackbarService.snackbar("שגיאה בהעלאת התמונה");
        }
    }

    showChatNotification(msgData: any, isSelfMessageNotification: boolean) {
        if (this.messageNotificationInterval) {
            clearInterval(this.messageNotificationInterval);
        }

        this.isSelfMessageNotification = isSelfMessageNotification;
        this.messageNotificationFriendObj = this.getFriendById(msgData.from);
        this.messageNotificationText = msgData.isImage ? null : msgData.text;
        this.isShowMessageNotification = true;

        let self = this;

        self.messageNotificationInterval = setInterval(function () {
            self.isShowMessageNotification = false;
            clearInterval(self.messageNotificationInterval);
            self.messageNotificationInterval = null;
        }, self.messageNotificationDelay);
    }

    clickChatNotification() {
        this.isShowMessageNotification = false;

        if (this.messageNotificationInterval) {
            clearInterval(this.messageNotificationInterval);
        }

        if (this.isSelfMessageNotification) {
            this.getTopIconById("chat").onClick();
        }
        else {
            this.openChat(this.messageNotificationFriendObj);
        }
    }

    reloadChat() {
        this.isChatLoadingError = false;
        this.initializeChat();
    }

    chatScrollTopFunc() {
        if ($("#chat-body-sector").scrollTop() < 400 &&
            $("#chat-body-sector").hasScrollBar() &&
            !this.isMessagesPageLoading &&
            (this.messages.length < this.totalMessagesNum)) {
            this.isMessagesPageLoading = true;

            this.chatService.getChatPage([this.chatData.user._id, this.chatData.friend._id],
                this.messages.length, this.totalMessagesNum).then((chat: any) => {
                    this.isMessagesPageLoading = false;

                    if (chat) {
                        this.lastPageMessageId = this.messages[0].id;
                        this.isAllowScrollDown = false;
                        this.messages = chat.messages.concat(this.messages);

                        if (this.messages.length == this.totalMessagesNum) {
                            $("#chat-body-sector")[0].removeEventListener("scroll", this.chatScrollTopFunc.bind(this));
                        }
                    }
                    else {
                        this.isChatLoadingError = true;
                    }
                });
        }
    }

    moveToFriendPage(friendObj: any) {
        this.eventService.emit(EVENT_TYPE.openUserProfile, friendObj);
    }
}