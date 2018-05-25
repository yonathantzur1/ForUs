import { Component, OnInit, Input } from '@angular/core';

declare var $: any;

var loaderDotsComponentinstances = 0;

@Component({
  selector: 'loaderDots',
  templateUrl: './loaderDots.html'
})

export class LoaderDotsComponent implements OnInit {
  @Input() css: any;
  idIndex: string = "";
  isShow: boolean = false;

  ngOnInit() {
    this.idIndex += loaderDotsComponentinstances;
    loaderDotsComponentinstances++;

    try {
      setTimeout((function () {
        this.css && $('#load-icon-' + this.idIndex).css(JSON.parse(this.css));
        this.isShow = true;
      }).bind(this), 0);
    }
    catch (e) {
      console.warn("Faild to parse spinner css object");
    }
  }
}