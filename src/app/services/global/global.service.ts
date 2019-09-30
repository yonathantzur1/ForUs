import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CookieService } from './cookie.service';
import { LoginService } from '../welcome/login.service';

import { PERMISSION } from '../../enums/enums';

declare let io: any;
declare let $: any;
declare let jQuery: any;
const defaultProfileImagePath: string = "/assets/images/default_profile_img.jpg";

@Injectable()
export class GlobalService extends LoginService {

    // Use this property for property binding    
    public socket: any;
    public userId: string;
    public userProfileImage: string;
    public userPermissions: Array<string>;
    public defaultProfileImage: string;
    public globalObject: any;

    constructor(public http: HttpClient,
        private cookieService: CookieService) {
        super(http);

        // Close modal when click back on browser.
        $(window).on('popstate', function () {
            let modalObj = $(".modal");
            if (modalObj.length > 0) {
                modalObj.modal("hide");
            }
        });

        // Add jQuery function to find if element has scroll bar.
        (function ($) {
            $.fn.hasScrollBar = function () {
                return this.get(0).scrollHeight > this.get(0).clientHeight;
            }
        })(jQuery);

        // Initialize variables        
        this.userPermissions = [];
        this.defaultProfileImage = defaultProfileImagePath;

        this.ImageToBase64(defaultProfileImagePath, (imgBase64: string) => {
            this.defaultProfileImage = imgBase64;
        });

        // Global variables and functions
        let globalObject = this.globalObject = {
            days: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
            months: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
            shortMonths: ["ינו'", "פבר'", "מרץ", "אפר'", "מאי", "יוני", "יול'", "אוג'", "ספט'", "אוק'", "נוב'", "דצמ'"],
            GetDateDetailsString: (localDate: Date, currDate: Date, isShortMonths?: boolean) => {
                currDate.setHours(23, 59, 59, 999);

                let timeDiff = Math.abs(currDate.getTime() - localDate.getTime());
                let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                let datesDaysDiff = Math.abs(currDate.getDay() - localDate.getDay());

                let dateDetailsString = '';

                if (diffDays <= 7) {
                    if (diffDays <= 2) {
                        if (currDate.getDate() == localDate.getDate()) {
                            dateDetailsString = "היום";
                        }
                        else if (Math.min((7 - datesDaysDiff), datesDaysDiff) <= 1) {
                            dateDetailsString = "אתמול";
                        }
                        else {
                            dateDetailsString = globalObject.days[localDate.getDay()];
                        }
                    }
                    else {
                        dateDetailsString = globalObject.days[localDate.getDay()];
                    }
                }
                else {
                    // In case of the same year or different years but for the first half of year.
                    if (localDate.getFullYear() == currDate.getFullYear() || diffDays < (365 / 2)) {
                        let monthString = isShortMonths ? globalObject.shortMonths[localDate.getMonth()] : globalObject.months[localDate.getMonth()];
                        dateDetailsString = (localDate.getDate()) + " ב" + monthString;
                    }
                    else {
                        dateDetailsString = (localDate.getDate()) + "/" + (localDate.getMonth() + 1) + "/" + localDate.getFullYear();
                    }
                }

                return dateDetailsString;
            }
        }
    }

    IsSmallScreenDevice() {
        return ($(window).width() < 576);
    }

    Initialize() {
        if (!this.socket) {
            this.socket = io();

            super.GetUserPermissions().then((result) => {
                this.userPermissions = result || [];
            });
        }
    }

    IsUserHasAdminPermission() {
        return (this.userPermissions.indexOf(PERMISSION.ADMIN) != -1);
    }

    IsUserHasMasterPermission() {
        return (this.userPermissions.indexOf(PERMISSION.MASTER) != -1);
    }

    IsUserHasRootPermission() {
        return (this.IsUserHasAdminPermission() || this.IsUserHasMasterPermission());
    }

    ResetGlobalVariables() {
        this.socket && this.socket.destroy();
        this.socket = null;
        this.userProfileImage = null;
        this.userPermissions = [];
    }

    // This function should be called in order to refresh
    // the client cookies (token) that the socket object contains.
    RefreshSocket() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket.connect();
            this.socket.emit('login');
        }
    }

    ConvertArrayToString(params: any[]): string {
        let paramsString = '';

        if (!params || params.length == 0) {
            return null;
        }
        else {
            params.forEach((param: any) => {
                if (typeof (param) == "object") {
                    paramsString += JSON.stringify(param);
                }
                else if (typeof (param) == "string") {
                    paramsString += "'" + param + "'";
                }
                else {
                    paramsString += param.toString();
                }

                paramsString += ",";
            });

            return paramsString.substring(0, paramsString.length - 1);
        }
    }

    // Emit socket event before initialize the socket object.
    SocketEmit(funcName: string, ...params: any[]) {
        let socketObjStr = this.socket ? "this.socket" : "io()";
        eval(socketObjStr + ".emit('" + funcName + "'," + this.ConvertArrayToString(params) + ");");
    }

    SocketOn(name: string, func: Function) {
        this.socket.on(name, func);
    }

    Logout() {
        this.cookieService.DeleteCookieByName(this.cookieService.uidCookieName);
        this.DeleteTokenFromCookie();
        this.ResetGlobalVariables();
    }

    ImageToBase64(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }
}