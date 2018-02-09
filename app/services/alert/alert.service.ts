export enum AlertType {
    CONFIRM = "confirm",
    DANGER = "danger",
    WARNING = "warning"
}

export class AlertService {
    private isShow: boolean;
    private isLoading: boolean;
    private showCancelButton: boolean;
    private title: string;
    private text: string;
    private type: AlertType;
    private preConfirm: Function;
    private confirmFunc: Function;
    private closeFunc: Function;
    private confirmBtnText: string;
    private closeBtnText: string;
    private image: string;

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