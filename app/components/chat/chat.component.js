"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var chat_service_1 = require("../../services/chat/chat.service");
var global_service_1 = require("../../services/global/global.service");
var topIcon = /** @class */ (function () {
    function topIcon() {
    }
    return topIcon;
}());
exports.topIcon = topIcon;
var canvasTopIcon = /** @class */ (function () {
    function canvasTopIcon() {
    }
    return canvasTopIcon;
}());
exports.canvasTopIcon = canvasTopIcon;
var ChatComponent = /** @class */ (function () {
    function ChatComponent(chatService, globalService) {
        var _this = this;
        this.chatService = chatService;
        this.globalService = globalService;
        this.messages = [];
        this.chatBodyScrollHeight = 0;
        this.days = globalVariables.days;
        this.months = globalVariables.months;
        this.InitializeChat = function () {
            var self = this;
            if (this.isCanvasInitialize) {
                self.SelectTopIcon(self.GetTopIconById("chat"));
                this.InitializeCanvas();
            }
            self.isAllowShowUnreadLine = true;
            self.chatBodyScrollHeight = 0;
            self.isMessagesLoading = true;
            self.chatService.GetChat([self.chatData.user._id, self.chatData.friend._id]).then(function (chat) {
                if (chat) {
                    self.messages = chat.messages;
                }
                self.isMessagesLoading = false;
                $("#msg-input").focus();
            });
        };
        this.CloseChat = function () {
            this.chatData.isOpen = false;
        };
        this.SendMessage = function () {
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
        };
        this.MsgInputKeyup = function (event) {
            // In case of pressing ENTER.
            if (event.keyCode == 13) {
                this.SendMessage();
            }
            else if (event.keyCode == 27) {
                this.CloseChat();
            }
            else {
                this.socket.emit("ServerFriendTyping", this.chatData.friend._id);
            }
        };
        this.ScrollToBottom = function () {
            $("#chat-body-sector")[0].scrollTop = $("#chat-body-sector")[0].scrollHeight;
        };
        this.GetTimeString = function (date) {
            var localDate = new Date(date);
            var HH = localDate.getHours().toString();
            var mm = localDate.getMinutes().toString();
            if (mm.length == 1) {
                mm = "0" + mm;
            }
            return (HH + ":" + mm);
        };
        this.IsShowUnreadLine = function (msgFromId, msgId, msgIndex) {
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
        };
        this.GetUnreadMessagesNumberText = function (unreadMessagesNumber) {
            if (unreadMessagesNumber == 1) {
                return ("הודעה 1 שלא נקראה");
            }
            else {
                return (unreadMessagesNumber + " הודעות שלא נקראו");
            }
        };
        this.IsShowDateBubble = function (index) {
            if (index == 0) {
                return true;
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
        };
        this.GetDateBubbleText = function (index) {
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
                    dateDetailsString = (localDate.getDate()) + " ב" + this.months[localDate.getMonth()];
                }
                else {
                    dateDetailsString = (localDate.getDate()) + "/" + (localDate.getMonth() + 1) + "/" + localDate.getFullYear();
                }
            }
            return dateDetailsString;
        };
        this.GetTopIconById = function (id) {
            for (var i = 0; i < this.topIcons.length; i++) {
                if (this.topIcons[i].id == id) {
                    return this.topIcons[i];
                }
            }
            return null;
        };
        this.InitializeCanvas = function () {
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
        };
        // Get the position of the mouse relative to the canvas
        this.GetMousePos = function (canvasDom, mouseEvent) {
            var rect = canvasDom.getBoundingClientRect();
            return {
                x: mouseEvent.clientX - rect.left,
                y: mouseEvent.clientY - rect.top
            };
        };
        this.RenderCanvas = function () {
            if (this.drawing) {
                var offset = $("#sig-canvas").offset();
                this.ctx.moveTo(this.lastPos.x - offset.left, this.lastPos.y);
                this.ctx.lineTo(this.mousePos.x - offset.left, this.mousePos.y);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.lastPos = this.mousePos;
            }
        };
        // Get the position of a touch relative to the canvas
        this.GetTouchPos = function (canvasDom, touchEvent) {
            var rect = canvasDom.getBoundingClientRect();
            return {
                x: touchEvent.touches[0].clientX - rect.left,
                y: touchEvent.touches[0].clientY - rect.top
            };
        };
        this.ChangeCanvasColor = function (colorIndex) {
            this.canvasSelectedColorIndex = colorIndex;
            this.ctx.strokeStyle = this.colorBtns[colorIndex];
        };
        this.SendCanvas = function () {
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
        };
        this.ShowHideCanvasTopSector = function () {
            if (this.isCanvasTopOpen) {
                this.canvasTopBar.style.bottom = "0px";
            }
            else {
                this.canvasTopBar.style.bottom = "40px";
            }
            this.isCanvasTopOpen = !this.isCanvasTopOpen;
        };
        this.HideCanvasTopSector = function () {
            if (this.isCanvasTopOpen) {
                this.canvasTopBar.style.bottom = "0px";
                this.isCanvasTopOpen = false;
            }
        };
        this.UploadImage = function () {
            var self = this;
            var URL = window.URL;
            var $chatImage = $('#chatImage');
            if (URL) {
                var files = $chatImage[0].files;
                var file;
                if (files && files.length) {
                    file = files[0];
                    if (/^image\/\w+$/.test(file.type)) {
                        loadImage(file, function (img) {
                            self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
                            self.ctx.drawImage(img, (self.canvas.width - img.width) / 2, (self.canvas.height - img.height) / 2);
                            self.undoArray.push(self.canvas.toDataURL());
                            self.isCanvasEmpty = false;
                        }, {
                            maxWidth: self.canvas.width,
                            maxHeight: self.canvas.height,
                            canvas: true,
                            orientation: true,
                        });
                        $chatImage.val('');
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
            return null;
        };
        this.ChangeImage = function () {
            var isSuccess = this.UploadPhoto();
            if (isSuccess == false) {
                $("#canvas-image-failed").snackbar("show");
            }
            else if (isSuccess == null) {
                $("#canvas-upload-failed").snackbar("show");
            }
        };
        this.socket = globalService.socket;
        this.subscribeObj = this.globalService.data.subscribe(function (value) {
            if (value["chatData"]) {
                _this.messages = [];
                _this.chatData = value["chatData"];
                _this.InitializeChat();
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
                        };
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
    ChatComponent.prototype.ngOnInit = function () {
        var self = this;
        self.socket.on('GetMessage', function (msgData) {
            if (msgData.from == self.chatData.friend._id) {
                msgData.time = new Date();
                self.messages.push(msgData);
            }
        });
        self.InitializeCanvas();
        self.canvasEvents = {
            "mousedown": function (e) {
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
            "mouseup": function (e) {
                self.drawing = false;
                self.undoArray.push(self.canvas.toDataURL());
            },
            "mousemove": function (e) {
                self.mousePos = self.GetMousePos(self.canvas, e);
            },
            "mouseout": function (e) {
                if (self.drawing) {
                    self.undoArray.push(self.canvas.toDataURL());
                }
                self.drawing = false;
            },
            "touchstart": function (e) {
                self.mousePos = self.GetTouchPos(self.canvas, e);
                var touch = e.touches[0];
                var mouseEvent = new MouseEvent("mousedown", {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                self.canvas.dispatchEvent(mouseEvent);
            },
            "touchend": function (e) {
                var mouseEvent = new MouseEvent("mouseup", {});
                self.canvas.dispatchEvent(mouseEvent);
            },
            "touchmove": function (e) {
                var touch = e.touches[0];
                var mouseEvent = new MouseEvent("mousemove", {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                self.canvas.dispatchEvent(mouseEvent);
            }
        };
        self.documentEvents = {
            "touchstart": function (e) {
                if (e.target == self.canvas) {
                    e.preventDefault();
                }
            },
            "touchend": function (e) {
                if (e.target == self.canvas) {
                    e.preventDefault();
                }
            },
            "touchmove": function (e) {
                if (e.target == self.canvas) {
                    e.preventDefault();
                }
            }
        };
        Object.keys(self.canvasEvents).forEach(function (key) {
            self.canvas.addEventListener(key, self.canvasEvents[key], false);
        });
        Object.keys(self.documentEvents).forEach(function (key) {
            document.body.addEventListener(key, self.documentEvents[key], false);
        });
        self.CanvasResizeFunc = function () {
            var image = new Image;
            image.src = self.canvas.toDataURL();
            var canvasContainer = document.getElementById("canvas-body-sector");
            self.canvas.width = canvasContainer.offsetWidth;
            self.canvas.height = canvasContainer.offsetHeight;
            image.onload = function () {
                self.ctx.drawImage(image, 0, 0);
            };
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
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
        // Allow for animation
        (function drawLoop() {
            window.requestAnimFrame(drawLoop);
            self.RenderCanvas();
        })();
    };
    ChatComponent.prototype.ngOnDestroy = function () {
        var self = this;
        self.subscribeObj.unsubscribe();
        Object.keys(this.canvasEvents).forEach(function (key) {
            self.canvas.removeEventListener(key, self.canvasEvents[key], false);
        });
        Object.keys(this.documentEvents).forEach(function (key) {
            document.body.removeEventListener(key, self.documentEvents[key], false);
        });
        $(window).off("resize", self.CanvasResizeFunc);
        this.isCanvasInitialize = false;
    };
    ChatComponent.prototype.ngAfterViewChecked = function () {
        if ($("#chat-body-sector")[0].scrollHeight != this.chatBodyScrollHeight) {
            this.ScrollToBottom();
            this.chatBodyScrollHeight = $("#chat-body-sector")[0].scrollHeight;
        }
        if (this.GetTopIconById("canvas").isSelected &&
            this.canvas &&
            (this.canvas.width == 0 || this.canvas.height == 0)) {
            this.InitializeCanvas();
        }
    };
    ChatComponent.prototype.SelectTopIcon = function (iconObj) {
        this.topIcons.forEach(function (obj) {
            obj.isSelected = false;
        });
        iconObj.isSelected = true;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], ChatComponent.prototype, "chatData", void 0);
    ChatComponent = __decorate([
        core_1.Component({
            selector: 'chat',
            templateUrl: './chat.html',
            providers: [chat_service_1.ChatService]
        }),
        __metadata("design:paramtypes", [chat_service_1.ChatService, global_service_1.GlobalService])
    ], ChatComponent);
    return ChatComponent;
}());
exports.ChatComponent = ChatComponent;
//# sourceMappingURL=chat.component.js.map