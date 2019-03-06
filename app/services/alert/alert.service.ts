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
    public finalFunc: Function;
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
    }

    Alert(alertObject: any) {
        if (alertObject) {
            (alertObject.showCancelButton != null) && (this.showCancelButton = alertObject.showCancelButton);
            this.title = alertObject.title;;
            this.text = alertObject.text;
            this.preConfirm = alertObject.preConfirm;
            this.confirmFunc = alertObject.confirmFunc;
            this.closeFunc = alertObject.closeFunc;
            this.finalFunc = alertObject.finalFunc;
            (alertObject.confirmBtnText != null) && (this.confirmBtnText = alertObject.confirmBtnText);
            (alertObject.closeBtnText != null) && (this.closeBtnText = alertObject.closeBtnText);
            this.type = alertObject.type;
            this.image = alertObject.image;
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
            this.ActivateAlertClose();
        }
    }

    Close() {
        this.closeFunc && this.closeFunc();
        this.ActivateAlertClose();
    }

    ActivateAlertClose() {
        this.finalFunc && this.finalFunc();
        this.Initialize();
    }
}