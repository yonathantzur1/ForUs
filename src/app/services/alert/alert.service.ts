export enum ALERT_TYPE {
    INFO,
    DANGER,
    WARNING
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
    public disableEscapeExit: boolean;

    private newLine: string = "{{enter}}";

    private Initialize() {
        this.isShow = false;
        this.isLoading = false;
        this.showCancelButton = true;
        this.text = "";
        this.confirmBtnText = "אישור";
        this.closeBtnText = "ביטול";
    }

    Alert(alt: any) {
        this.Initialize();

        if (alt) {
            this.title = alt.title;
            (alt.text != null) && (this.text = alt.text.replace(new RegExp(this.newLine, 'g'), "\n"));
            (alt.showCancelButton != null) && (this.showCancelButton = alt.showCancelButton);
            (alt.confirmBtnText != null) && (this.confirmBtnText = alt.confirmBtnText);
            (alt.closeBtnText != null) && (this.closeBtnText = alt.closeBtnText);
            this.preConfirm = alt.preConfirm;
            this.confirmFunc = alt.confirmFunc;
            this.closeFunc = alt.closeFunc;
            this.finalFunc = alt.finalFunc;
            this.type = alt.type;
            this.image = alt.image;
            this.disableEscapeExit = alt.disableEscapeExit;
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