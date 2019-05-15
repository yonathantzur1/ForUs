import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pageNotFound',
  templateUrl: './pageNotFound.html'
})

export class PageNotFoundComponent implements OnInit {
  numOfMonsters: number = 9;
  monsterImagePath: string = null;

  constructor(private router: Router) { }

  ngOnInit() {
    this.monsterImagePath = "./app/pictures/monsters/" + this.GetRandomMonsterPath();
  }

  GetRandomMonsterPath() {
    // Rundom monster number.
    let imageNumber = Math.floor(Math.random() * this.numOfMonsters) + 1;

    return ("monster" + imageNumber + ".png");
  }

  MainRoute() {
    this.router.navigateByUrl('/');
  }
}