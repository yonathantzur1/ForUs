export class SnackbarService {
    public delay: number;
    public isShow: boolean;
    public text: string;
    public onClick: Function;

    private currentTimeout: any;

    constructor() {
        this.Initialize();
    }

    private Initialize() {
        this.delay = 2500; // milliseconds
        this.isShow = false;
        this.currentTimeout = null;
        this.text = '';
    }

    Snackbar(text: string, delay?: number, onClick?: Function) {
        // Clear timeout if exists.
        clearTimeout(this.currentTimeout);

        // Set message text and show the snackbar.
        this.text = text;
        this.isShow = true;
        this.onClick = () => {
            onClick && onClick();
            this.HideSnackbar();
        };

        this.currentTimeout = setTimeout(() => {
            this.Initialize()
        }, delay || this.delay);
    }

    HideSnackbar() {
        this.isShow = false;
    }
}