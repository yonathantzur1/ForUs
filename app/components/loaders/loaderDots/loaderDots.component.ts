import { Component, OnInit, Input } from '@angular/core';

declare var $: any;

@Component({
  selector: 'loaderDots',
  templateUrl: './loaderDots.html'
})

export class LoaderDotsComponent implements OnInit {
  @Input() css: any;

  ngOnInit() {
    try {
      this.css && $('#load-icon').css(JSON.parse(this.css));
    }
    catch (e) {
      console.warn("Faild to parse spinner css object");
    }
  }
}