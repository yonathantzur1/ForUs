import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pageNotFound',
  templateUrl: './pageNotFound.html'
})

export class PageNotFoundComponent implements OnInit {
  numOfMonsters: number = 9;
  monsterImagePath: string = null;

  ngOnInit() {
    this.monsterImagePath = "./app/pictures/monsters/" + this.GetRandomMonsterPath();
  }

  GetRandomMonsterPath() {
    var imageNumber = Math.floor(Math.random() * this.numOfMonsters) + 1;

    return ("monster" + imageNumber + ".png");
  }
}