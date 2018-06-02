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
var ChatComponent = /** @class */ (function () {
    function ChatComponent(chatService, globalService) {
        var _this = this;
        this.chatService = chatService;
        this.globalService = globalService;
        this.chatBodyScrollHeight = 0;
        this.messageNotificationDelay = 3800; // milliseconds
        this.subscribeObj = this.globalService.data.subscribe(function (value) {
            if (value["chatData"]) {
                _this.chatData = value["chatData"];
                _this.InitializeChat();
            }
            if (value["moveToChatWindow"]) {
                _this.SelectTopIcon(_this.GetTopIconById("chat"));
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
        self.globalService.SocketOn('GetMessage', function (msgData) {
            if (msgData.from == self.chatData.friend._id) {
                msgData.time = new Date();
                self.isAllowScrollDown = true;
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
        Object.keys(self.canvasEvents).forEach(function (key) {
            self.canvas.addEventListener(key, self.canvasEvents[key], false);
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
                self.ctx.drawImage(image, 0, 0);
            };
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
        $("#canvas-top-bar-sector").unbind('touchstart', preventZoom);
        $("#canvas-bar-sector").unbind('touchstart', preventZoom);
        window.removeEventListener("resize", self.CanvasResizeFunc);
        this.isCanvasInitialize = false;
    };
    ChatComponent.prototype.ngAfterViewChecked = function () {
        if ($("#chat-body-sector")[0].scrollHeight != this.chatBodyScrollHeight && this.isAllowScrollDown) {
            this.ScrollToBottom();
            this.chatBodyScrollHeight = $("#chat-body-sector")[0].scrollHeight;
        }
        if (this.GetTopIconById("canvas").isSelected &&
            this.canvas &&
            (this.canvas.width == 0 || this.canvas.height == 0)) {
            this.InitializeCanvas();
        }
    };
    ChatComponent.prototype.InitializeChat = function () {
        var _this = this;
        if (this.isCanvasInitialize) {
            this.SelectTopIcon(this.GetTopIconById("chat"));
            this.InitializeCanvas();
        }
        this.messages = [];
        this.msghInput = "";
        this.isAllowScrollDown = true;
        this.isAllowShowUnreadLine = true;
        this.chatBodyScrollHeight = 0;
        this.isMessagesLoading = true;
        this.isChatLoadingError = false;
        this.chatService.GetChat([this.chatData.user._id, this.chatData.friend._id]).then(function (chat) {
            if (chat) {
                _this.messages = chat.messages;
                _this.totalMessagesNum = chat.totalMessagesNum;
                var chatBodySectorElement = $("#chat-body-sector");
                if (chatBodySectorElement && chatBodySectorElement.length > 0) {
                    chatBodySectorElement[0].removeEventListener("scroll", _this.ChatScrollTopFunc.bind(_this));
                }
                (_this.messages.length < _this.totalMessagesNum) && chatBodySectorElement[0].addEventListener("scroll", _this.ChatScrollTopFunc.bind(_this));
            }
            else if (chat == null) {
                _this.isChatLoadingError = true;
            }
            _this.isMessagesLoading = false;
            $("#msg-input").focus();
        });
    };
    ChatComponent.prototype.CloseChat = function () {
        this.chatData.isOpen = false;
    };
    ChatComponent.prototype.SendMessage = function () {
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
                this.isAllowScrollDown = true;
                this.isAllowShowUnreadLine = false;
                this.messages.push(msgData);
                $("#msg-input").focus();
                this.globalService.socket.emit("SendMessage", msgData);
            }
        }
    };
    ChatComponent.prototype.MsgInputKeyup = function (event) {
        // In case of pressing ENTER.
        if (event.keyCode == 13) {
            this.SendMessage();
        }
        // In case of pressing ESCAPE.
        else if (event.keyCode == 27) {
            this.CloseChat();
        }
        else {
            this.globalService.socket.emit("ServerFriendTyping", this.chatData.friend._id);
        }
    };
    ChatComponent.prototype.ScrollToBottom = function () {
        $("#chat-body-sector")[0].scrollTop = $("#chat-body-sector")[0].scrollHeight;
    };
    ChatComponent.prototype.GetTimeString = function (date) {
        var localDate = new Date(date);
        var HH = localDate.getHours().toString();
        var mm = localDate.getMinutes().toString();
        if (mm.length == 1) {
            mm = "0" + mm;
        }
        return (HH + ":" + mm);
    };
    ChatComponent.prototype.IsShowUnreadLine = function (msgFromId, msgId, msgIndex) {
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
    ChatComponent.prototype.GetUnreadMessagesNumberText = function (unreadMessagesNumber) {
        if (unreadMessagesNumber == 1) {
            return ("הודעה 1 שלא נקראה");
        }
        else {
            return (unreadMessagesNumber + " הודעות שלא נקראו");
        }
    };
    ChatComponent.prototype.IsShowDateBubble = function (index) {
        if (index > 0) {
            var currMessageDate = new Date(this.messages[index].time);
            var beforeMessageDate = new Date(this.messages[index - 1].time);
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
    };
    ChatComponent.prototype.GetDateBubbleText = function (index) {
        return GetDateDetailsString(new Date(this.messages[index].time), new Date(), false);
    };
    ChatComponent.prototype.GetTopIconById = function (id) {
        for (var i = 0; i < this.topIcons.length; i++) {
            if (this.topIcons[i].id == id) {
                return this.topIcons[i];
            }
        }
        return null;
    };
    ChatComponent.prototype.SelectTopIcon = function (iconObj) {
        this.topIcons.forEach(function (obj) {
            obj.isSelected = false;
        });
        iconObj.isSelected = true;
    };
    ChatComponent.prototype.InitializeCanvas = function () {
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
    ChatComponent.prototype.GetMousePos = function (canvasDom, mouseEvent) {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - rect.left,
            y: mouseEvent.clientY - rect.top
        };
    };
    ChatComponent.prototype.RenderCanvas = function () {
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
    ChatComponent.prototype.GetTouchPos = function (canvasDom, touchEvent) {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        };
    };
    ChatComponent.prototype.ChangeCanvasColor = function (colorIndex) {
        this.canvasSelectedColorIndex = colorIndex;
        this.ctx.strokeStyle = this.colorBtns[colorIndex];
    };
    ChatComponent.prototype.SendCanvas = function () {
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
            this.isAllowScrollDown = true;
            this.messages.push(msgData);
            this.globalService.socket.emit("SendMessage", msgData);
        }
    };
    ChatComponent.prototype.ShowHideCanvasTopSector = function () {
        if (this.isCanvasTopOpen) {
            this.canvasTopBar.style.bottom = "0px";
        }
        else {
            this.canvasTopBar.style.bottom = "40px";
        }
        this.isCanvasTopOpen = !this.isCanvasTopOpen;
    };
    ChatComponent.prototype.HideCanvasTopSector = function () {
        if (this.isCanvasTopOpen) {
            this.canvasTopBar.style.bottom = "0px";
            this.isCanvasTopOpen = false;
        }
    };
    ChatComponent.prototype.UploadImage = function () {
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
                    self.HideCanvasTopSector();
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        return null;
    };
    ChatComponent.prototype.ChangeImage = function () {
        var isSuccess = this.UploadImage();
        if (isSuccess == false) {
            snackbar("הקובץ שנבחר אינו תמונה");
        }
        else if (isSuccess == null) {
            snackbar("שגיאה בהעלאת התמונה");
        }
    };
    ChatComponent.prototype.ShowChatNotification = function (msgData, isSelfMessageNotification) {
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
    };
    ChatComponent.prototype.ClickChatNotification = function () {
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
    };
    ChatComponent.prototype.ReloadChat = function () {
        this.isChatLoadingError = false;
        this.InitializeChat();
    };
    ChatComponent.prototype.ChatScrollTopFunc = function () {
        var _this = this;
        if ($("#chat-body-sector").scrollTop() < 400 &&
            $("#chat-body-sector").hasScrollBar() &&
            !this.isMessagesPageLoading &&
            (this.messages.length < this.totalMessagesNum)) {
            this.isMessagesPageLoading = true;
            this.chatService.GetChatPage([this.chatData.user._id, this.chatData.friend._id], this.messages.length, this.totalMessagesNum).then(function (chat) {
                _this.isMessagesPageLoading = false;
                if (chat) {
                    _this.lastPageMessageId = _this.messages[0].id;
                    _this.isAllowScrollDown = false;
                    _this.messages = chat.messages.concat(_this.messages);
                    if (_this.messages.length == _this.totalMessagesNum) {
                        $("#chat-body-sector")[0].removeEventListener("scroll", _this.ChatScrollTopFunc.bind(_this));
                    }
                }
                else {
                    _this.isChatLoadingError = true;
                }
            });
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], ChatComponent.prototype, "chatData", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Function)
    ], ChatComponent.prototype, "GetFriendById", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Function)
    ], ChatComponent.prototype, "OpenChat", void 0);
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
function preventZoom(e) {
    var t2 = e.timeStamp, t1 = $(this).data('lastTouch') || t2, dt = t2 - t1, fingers = e.touches.length;
    $(this).data('lastTouch', t2);
    if (!dt || dt > 400 || fingers > 1)
        return; // not double-tap
    e.preventDefault(); // double tap - prevent the zoom
    // also synthesize click events we just swallowed up
    $(this).trigger('click').trigger('click');
}
//# sourceMappingURL=chat.component.js.map