import { Component, OnInit, ViewChild } from '@angular/core';
import { PokemonsComponent } from '../pokemons/pokemons.component';

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.scss'],
})
export class PokedexComponent implements OnInit {
  @ViewChild(PokemonsComponent, { static: true }) pokemons;

  constructor() {}

  ngOnInit() {}

  passData($event) {
    if ($event === 'filters') {
      this.pokemons.displayFiltered();
    } else if (
      ['nameAsc', 'nameDesc', 'indexAsc', 'indexDesc'].includes($event)
    ) {
      this.pokemons.displaySorted($event);
    } else {
      this.pokemons.searchPokemon($event);
    }
  }
}
