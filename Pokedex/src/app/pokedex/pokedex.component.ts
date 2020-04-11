import { Component, OnInit, ViewChild } from '@angular/core';
// import { TopbarComponent } from '../topbar/topbar.component';
import { PokemonsComponent } from '../pokemons/pokemons.component';

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.scss'],
})
export class PokedexComponent implements OnInit {
  // @ViewChild(TopbarComponent, { static: true }) topbar;
  @ViewChild(PokemonsComponent, { static: true }) pokemons;

  constructor() {}

  ngOnInit() {}

  passData($event) {
    this.pokemons.displayFiltered($event);
  }
}
