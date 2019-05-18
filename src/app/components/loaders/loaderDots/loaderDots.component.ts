import { Component, OnInit, Input } from '@angular/core';

declare let $: any;

// Assign global counter variable.
let loaderDotsComponentInstances = 0;

@Component({
    selector: 'loaderDots',
    templateUrl: './loaderDots.html'
})

export class LoaderDotsComponent implements OnInit {
    @Input() css: any;
    idIndex: string = '';
    isShow: boolean = false;

    ngOnInit() {
        this.idIndex += loaderDotsComponentInstances;
        loaderDotsComponentInstances++;

        try {
            setTimeout((() => {
                this.css && $('#load-icon-' + this.idIndex).css(JSON.parse(this.css));
                this.isShow = true;
            }).bind(this), 0);
        }
        catch (e) {
            console.warn("Faild to parse spinner css object");
        }
    }
}