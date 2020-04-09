import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPokemonInfo } from '../_interfaces/IPokemonInfo';

@Injectable({
  providedIn: 'root',
})
export class PokeapiService {
  constructor(private http: HttpClient) {}

  public getImage(indexNumber: number) {
    return this.http.get(
      `'http://assets.pokemon.com/assets/cms2/img/pokedex/detail/${indexNumber}.png'`
    );
  }

  getPokemon(indexNum: number) {
    return this.http.get(`https://pokeapi.co/api/v2/pokemon/${indexNum}/`);
  }

  getPokemons() {
    return this.http.get('https://pokeapi.co/api/v2/pokemon');
  }

  getDitto() {
    return this.http.get('https://pokeapi.co/api/v2/pokemon/ditto/');
  }
}
