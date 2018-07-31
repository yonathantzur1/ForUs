export enum ALERT_TYPE {
    SUCCESS = "success",
    DANGER = "danger",
    WARNING = "warning"
}

export class AlertService {
    public isShow: boolean;
    public isLoading: boolean;
    public showCancelButton: boolean;
    public title: string;
    public text: string;
    public type: ALERT_TYPE;
    public preConfirm: Function;
    public confirmFunc: Function;
    public closeFunc: Function;
    public confirmBtnText: string;
    public closeBtnText: string;
    public image: string;

    constructor() {
        this.Initialize();
    }

    private Initialize() {
        this.isShow = false;
        this.isLoading = false;
        this.showCancelButton = true;
        this.confirmBtnText = "אישור";
        this.closeBtnText = "ביטול";
        this.title = null;
        this.text = null;
        this.type = null;
        this.preConfirm = null;
        this.confirmFunc = null;
        this.closeFunc = null;
        this.image = null;
    }

    Alert(alertObject: any) {
        if (alertObject) {
            (alertObject.showCancelButton != null) && (this.showCancelButton = alertObject.showCancelButton);
            alertObject.title && (this.title = alertObject.title);
            alertObject.text && (this.text = alertObject.text);
            alertObject.preConfirm && (this.preConfirm = alertObject.preConfirm);
            alertObject.confirmFunc && (this.confirmFunc = alertObject.confirmFunc);
            alertObject.closeFunc && (this.closeFunc = alertObject.closeFunc);
            alertObject.confirmBtnText && (this.confirmBtnText = alertObject.confirmBtnText);
            alertObject.closeBtnText && (this.closeBtnText = alertObject.closeBtnText);
            alertObject.type && (this.type = alertObject.type);
            alertObject.image && (this.image = alertObject.image);

            this.isShow = true;
        }
    }

    Confirm() {
        if (this.preConfirm) {
            this.isLoading = true;
            this.preConfirm().then(() => {
                this.isLoading = true;
                this.confirmFunc && this.confirmFunc();
                this.Initialize();
            });
        }
        else {
            this.confirmFunc && this.confirmFunc();
            this.Initialize();
        }
    }

    Close() {
        this.closeFunc && this.closeFunc();
        this.Initialize();
    }
}