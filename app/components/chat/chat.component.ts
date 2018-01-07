import { Component, OnInit, OnDestroy, Input, AfterViewChecked } from '@angular/core';

import { ChatService } from '../../services/chat/chat.service';
import { GlobalService } from '../../services/global/global.service';

declare var globalVariables: any;
declare var window: any;
declare var loadImage: any;

export class topIcon {
    id: string;
    class: string;
    innerIconText: string;
    title: string;
    isSelected: boolean;
    onClick: Function;
}

export class canvasTopIcon {
    icon: string;
    title: string;
    onClick: Function;
}

@Component({
    selector: 'chat',
    templateUrl: './chat.html',
    providers: [ChatService]
})

export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
    @Input() chatData: any;
    @Input() GetFriendById: Function;
    @Input() OpenChat: Function;
    socket: any;
    msghInput: string;
    messages: Array<any> = [];
    isMessagesLoading: boolean;
    chatBodyScrollHeight: number = 0;

    topIcons: Array<topIcon>;
    days: Array<string> = globalVariables.days;
    months: Array<string> = globalVariables.months;

    // Unread messages line sector properties //
    isAllowShowUnreadLine: boolean;
    unreadMessagesNumber: number;

    // Chat notification properties //
    isShowMessageNotification: boolean;
    isSelfMessageNotification: boolean;
    messageNotificationText: string;
    messageNotificationFriendObj: any;
    messageNotificationDelay: number = 3800; // milliseconds
    messageNotificationInterval: any;

    // Cavas sector properties //
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

    canvasTopIcons: Array<canvasTopIcon>;
    undoArray: Array<string>;

    canvasEvents: any;
    documentEvents: any;
    CanvasResizeFunc: any;

    subscribeObj: any;

    constructor(private chatService: ChatService, private globalService: GlobalService) {
        this.socket = globalService.socket;

        this.subscribeObj = this.globalService.data.subscribe(value => {
            if (value["chatData"]) {
                this.messages = [];
                this.chatData = value["chatData"];
                this.InitializeChat();
            }
            if (value["moveToChatWindow"]) {
                this.SelectTopIcon(this.GetTopIconById("chat"));
            }
        });

        var self = this;

        self.topIcons = [
            {
                id: "chat",
                class: "material-icons top-chat-icon",
                innerIconText: "chat",
                title: "צ'אט",
                isSelected: true,
                onClick: function () {
                    self.SelectTopIcon(this);
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
                    self.HideCanvasTopSector();
                    self.SelectTopIcon(this);
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
                        var image = new Image;
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

        self.colorBtns = ["#333", "#777", "#8a6d3b", "#3c763d",
            "#4caf50", "#03a9f4", "#3f51b5", "#6f0891",
            "#cf56d7", "#dbdb00", "#ff5722", "#eb1000"];
        self.isCanvasInitialize = false;
        self.isCanvasTopOpen = false;
    }

    ngOnInit() {
        var self = this;

        self.socket.on('GetMessage', function (msgData: any) {
            if (msgData.from == self.chatData.friend._id) {
                msgData.time = new Date();
                self.messages.push(msgData);

                // In case the chat is on canvas mode.
                if (self.GetTopIconById("canvas").isSelected) {
                    self.ShowChatNotification(msgData, true);
                }
            }
            else {
                self.ShowChatNotification(msgData, false);
            }
        });

        self.InitializeCanvas();

        self.canvasEvents = {
            "mousedown": function (e: any) {
                self.drawing = true;
                self.lastPos = self.GetMousePos(self.canvas, e);
                self.ctx.fillStyle = self.colorBtns[self.canvasSelectedColorIndex];
                self.ctx.fillRect(self.lastPos.x, self.lastPos.y, 1, 1);
                self.HideCanvasTopSector();

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
                self.mousePos = self.GetMousePos(self.canvas, e);
            },
            "mouseout": function (e: any) {
                if (self.drawing) {
                    self.undoArray.push(self.canvas.toDataURL());
                }

                self.drawing = false;
            },
            "touchstart": function (e: any) {
                self.mousePos = self.GetTouchPos(self.canvas, e);
                var touch = e.touches[0];
                var mouseEvent = new MouseEvent("mousedown", {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                self.canvas.dispatchEvent(mouseEvent);
            },
            "touchend": function (e: any) {
                var mouseEvent = new MouseEvent("mouseup", {});
                self.canvas.dispatchEvent(mouseEvent);
            },
            "touchmove": function (e: any) {
                var touch = e.touches[0];
                var mouseEvent = new MouseEvent("mousemove", {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                self.canvas.dispatchEvent(mouseEvent);
            }
        };

        self.documentEvents = {
            "touchstart": function (e: any) {
                if (e.target == self.canvas) {
                    e.preventDefault();
                }
            },
            "touchend": function (e: any) {
                if (e.target == self.canvas) {
                    e.preventDefault();
                }
            },
            "touchmove": function (e: any) {
                if (e.target == self.canvas) {
                    e.preventDefault();
                }
            }
        };

        Object.keys(self.canvasEvents).forEach(key => {
            self.canvas.addEventListener(key, self.canvasEvents[key], false);
        });

        Object.keys(self.documentEvents).forEach(key => {
            document.body.addEventListener(key, self.documentEvents[key], false);
        });

        $("#canvas-top-bar-sector").bind('touchstart', preventZoom);
        $("#canvas-bar-sector").bind('touchstart', preventZoom);

        self.CanvasResizeFunc = function () {
            var image = new Image;
            image.src = self.canvas.toDataURL();

            var canvasContainer = document.getElementById("canvas-body-sector");
            self.canvas.width = canvasContainer.offsetWidth;
            self.canvas.height = canvasContainer.offsetHeight;


            image.onload = function () {
                self.ctx.drawImage(image, 0, 0)
            }

            self.ctx.strokeStyle = self.colorBtns[self.canvasSelectedColorIndex];
        };

        $(window).resize(self.CanvasResizeFunc);

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
            self.RenderCanvas();
        })();
    }

    ngOnDestroy() {
        var self = this;

        self.subscribeObj.unsubscribe();

        Object.keys(this.canvasEvents).forEach(key => {
            self.canvas.removeEventListener(key, self.canvasEvents[key], false);
        });

        Object.keys(this.documentEvents).forEach(key => {
            document.body.removeEventListener(key, self.documentEvents[key], false);
        });

        $("#canvas-top-bar-sector").unbind('touchstart', preventZoom);
        $("#canvas-bar-sector").unbind('touchstart', preventZoom);

        $(window).off("resize", self.CanvasResizeFunc);

        this.isCanvasInitialize = false;
    }

    ngAfterViewChecked() {
        if ($("#chat-body-sector")[0].scrollHeight != this.chatBodyScrollHeight) {
            this.ScrollToBottom();
            this.chatBodyScrollHeight = $("#chat-body-sector")[0].scrollHeight;
        }

        if (this.GetTopIconById("canvas").isSelected &&
            this.canvas &&
            (this.canvas.width == 0 || this.canvas.height == 0)) {
            this.InitializeCanvas();
        }
    }

    InitializeChat() {
        var self = this;

        if (this.isCanvasInitialize) {
            self.SelectTopIcon(self.GetTopIconById("chat"));
            this.InitializeCanvas();
        }

        self.msghInput = "";
        self.isAllowShowUnreadLine = true;
        self.chatBodyScrollHeight = 0;
        self.isMessagesLoading = true;

        self.chatService.GetChat([self.chatData.user._id, self.chatData.friend._id]).then((chat: any) => {
            if (chat) {
                self.messages = chat.messages;
            }

            self.isMessagesLoading = false;
            $("#msg-input").focus();
        });
    }

    CloseChat() {
        this.chatData.isOpen = false;
    }

    SendMessage() {
        if (!this.isMessagesLoading && this.msghInput) {
            // Delete spaces from the start and the end of the message text.
            this.msghInput = this.msghInput.trim();

            if (this.msghInput) {
                var msgData = {
                    "from": this.chatData.user._id,
                    "to": this.chatData.friend._id,
                    "text": this.msghInput,
                    "time": new Date()
                };

                this.msghInput = "";
                this.isAllowShowUnreadLine = false;

                this.messages.push(msgData);
                this.socket.emit("SendMessage", msgData);
            }
        }
    }

    MsgInputKeyup(event: any) {
        // In case of pressing ENTER.
        if (event.keyCode == 13) {
            this.SendMessage();
        }
        // In case of pressing ESCAPE.
        else if (event.keyCode == 27) {
            this.CloseChat();
        }
        else {
            this.socket.emit("ServerFriendTyping", this.chatData.friend._id);
        }
    }

    ScrollToBottom() {
        $("#chat-body-sector")[0].scrollTop = $("#chat-body-sector")[0].scrollHeight;
    }

    GetTimeString(date: Date) {
        var localDate = new Date(date);

        var HH = localDate.getHours().toString();
        var mm = localDate.getMinutes().toString();

        if (mm.length == 1) {
            mm = "0" + mm;
        }

        return (HH + ":" + mm);
    }

    IsShowUnreadLine(msgFromId: string, msgId: string, msgIndex: number) {
        var friendMessagesNotifications = this.chatData.messagesNotifications[msgFromId];

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

    GetUnreadMessagesNumberText(unreadMessagesNumber: number) {
        if (unreadMessagesNumber == 1) {
            return ("הודעה 1 שלא נקראה");
        }
        else {
            return (unreadMessagesNumber + " הודעות שלא נקראו");
        }
    }

    IsShowDateBubble(index: number) {
        if (index == 0) {
            return true
        }
        else if (index > 0) {
            var currMessageDate = new Date(this.messages[index].time);
            var beforeMessageDate = new Date(this.messages[index - 1].time);

            if (currMessageDate.getDay() != beforeMessageDate.getDay() ||
                currMessageDate.getMonth() != beforeMessageDate.getMonth() ||
                currMessageDate.getFullYear() != beforeMessageDate.getFullYear()) {
                return true;
            }
        }

        return false;
    }

    GetDateBubbleText(index: number) {
        var localDate = new Date(this.messages[index].time);
        var currDate = new Date();
        currDate.setHours(23, 59, 59, 999);

        var timeDiff = Math.abs(currDate.getTime() - localDate.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        var datesDaysDiff = Math.abs(currDate.getDay() - localDate.getDay());

        var dateDetailsString = "";

        if (diffDays <= 7) {
            if (diffDays <= 2) {
                if (currDate.getDate() == localDate.getDate()) {
                    dateDetailsString = "היום";
                }
                else if (Math.min((7 - datesDaysDiff), datesDaysDiff) <= 1) {
                    dateDetailsString = "אתמול";
                }
                else {
                    dateDetailsString = this.days[localDate.getDay()];
                }
            }
            else {
                dateDetailsString = this.days[localDate.getDay()];
            }
        }
        else {
            if (localDate.getFullYear() == currDate.getFullYear()) {
                dateDetailsString = (localDate.getDate()) + " ב" + this.months[localDate.getMonth()]
            }
            else {
                dateDetailsString = (localDate.getDate()) + "/" + (localDate.getMonth() + 1) + "/" + localDate.getFullYear();
            }
        }


        return dateDetailsString;
    }

    GetTopIconById(id: string): topIcon {
        for (var i = 0; i < this.topIcons.length; i++) {
            if (this.topIcons[i].id == id) {
                return this.topIcons[i];
            }
        }

        return null;
    }

    SelectTopIcon(iconObj: any) {
        this.topIcons.forEach((obj: topIcon) => {
            obj.isSelected = false;
        });

        iconObj.isSelected = true;
    }

    InitializeCanvas() {
        this.canvas = document.getElementById("sig-canvas");
        this.canvasTopBar = document.getElementById("canvas-top-bar-sector");
        var canvasContainer = document.getElementById("canvas-body-sector");
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
    GetMousePos(canvasDom: any, mouseEvent: any) {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - rect.left,
            y: mouseEvent.clientY - rect.top
        };
    }

    RenderCanvas() {
        if (this.drawing) {
            var offset = $("#sig-canvas").offset();
            this.ctx.moveTo(this.lastPos.x - offset.left, this.lastPos.y);
            this.ctx.lineTo(this.mousePos.x - offset.left, this.mousePos.y);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.lastPos = this.mousePos;
        }
    }

    // Get the position of a touch relative to the canvas
    GetTouchPos(canvasDom: any, touchEvent: any) {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        };
    }

    ChangeCanvasColor(colorIndex: number) {
        this.canvasSelectedColorIndex = colorIndex;
        this.ctx.strokeStyle = this.colorBtns[colorIndex];
    }

    SendCanvas() {
        if (!this.isMessagesLoading && !this.isCanvasEmpty) {
            var imageBase64 = this.canvas.toDataURL();
            this.InitializeCanvas();
            this.SelectTopIcon(this.GetTopIconById("chat"));

            var msgData = {
                "from": this.chatData.user._id,
                "to": this.chatData.friend._id,
                "text": imageBase64,
                "isImage": true,
                "time": new Date()
            };

            this.messages.push(msgData);
            this.socket.emit("SendMessage", msgData);
        }
    }

    ShowHideCanvasTopSector() {
        if (this.isCanvasTopOpen) {
            this.canvasTopBar.style.bottom = "0px";
        }
        else {
            this.canvasTopBar.style.bottom = "40px";
        }

        this.isCanvasTopOpen = !this.isCanvasTopOpen;
    }

    HideCanvasTopSector() {
        if (this.isCanvasTopOpen) {
            this.canvasTopBar.style.bottom = "0px";
            this.isCanvasTopOpen = false;
        }
    }

    UploadImage() {
        var self = this;
        var URL = window.URL;
        var $chatImage: any = $('#chatImage');

        if (URL) {
            var files = $chatImage[0].files;
            var file;

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
                    self.HideCanvasTopSector();

                    return true;
                }
                else {
                    return false;
                }
            }
        }

        return null;
    }

    ChangeImage() {
        var isSuccess = this.UploadImage();

        if (isSuccess == false) {
            $("#canvas-image-failed").snackbar("show");
        }
        else if (isSuccess == null) {
            $("#canvas-upload-failed").snackbar("show");
        }
    }

    ShowChatNotification(msgData: any, isSelfMessageNotification: boolean) {
        if (this.messageNotificationInterval) {
            clearInterval(this.messageNotificationInterval);
        }

        this.isSelfMessageNotification = isSelfMessageNotification;
        this.messageNotificationFriendObj = this.GetFriendById(msgData.from);
        this.messageNotificationText = msgData.isImage ? null : msgData.text;
        this.isShowMessageNotification = true;

        var self = this;

        self.messageNotificationInterval = setInterval(function () {
            self.isShowMessageNotification = false;
            clearInterval(self.messageNotificationInterval);
            self.messageNotificationInterval = null;
        }, self.messageNotificationDelay);
    }

    ClickChatNotification() {
        this.isShowMessageNotification = false;

        if (this.messageNotificationInterval) {
            clearInterval(this.messageNotificationInterval);
        }

        if (this.isSelfMessageNotification) {
            this.GetTopIconById("chat").onClick();
        }
        else {
            this.OpenChat(this.messageNotificationFriendObj);
        }
    }
}

function preventZoom(e: any) {
    var t2 = e.timeStamp
        , t1 = $(this).data('lastTouch') || t2
        , dt = t2 - t1
        , fingers = e.touches.length;
    $(this).data('lastTouch', t2);
    if (!dt || dt > 400 || fingers > 1) return; // not double-tap

    e.preventDefault(); // double tap - prevent the zoom
    // also synthesize click events we just swallowed up
    $(this).trigger('click').trigger('click');
}