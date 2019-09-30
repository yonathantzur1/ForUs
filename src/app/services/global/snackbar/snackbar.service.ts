export class SnackbarService {
    public delay: number; // Snackbar milliseconds show delay
    public isShow: boolean;
    public text: string;

    private currentTimeout: any;

    constructor() {
        this.Initialize();
    }

    private Initialize() {
        this.delay = 2500;
        this.isShow = false;
        this.text = '';        
    }

    public Snackbar(text: string, delay?:number) {
        // Clear timeout if exists.
        this.currentTimeout && clearTimeout(this.currentTimeout);

        // Set the text and show the snackbar.
        this.text = text;
        this.isShow = true;

        this.currentTimeout = setTimeout(() => {
            this.isShow = false;
            this.currentTimeout = null;
        }, delay || this.delay);
    }

    public HideSnackbar() {
        this.isShow = false;
    }
}