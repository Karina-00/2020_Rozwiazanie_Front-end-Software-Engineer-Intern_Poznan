import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPokemonInfo } from '../_interfaces/IPokemonInfo';

@Injectable({
  providedIn: 'root',
})
export class PokeapiService {
  public urlTemplate = 'https://pokeapi.co/api/v2/';
  public limit = 12;
  constructor(private http: HttpClient) {}

  getPokemon(urlValue: string) {
    return this.http.get(`${this.urlTemplate}pokemon/${urlValue}/`);
  }

  getPokemons(
    url: string = `${this.urlTemplate}/pokemon/?limit=${this.limit}&offset=0`
  ) {
    return this.http.get(url);
  }

  // getEggType(indexNum: number) {
  //   return this.http.get(
  //     `https://pokeapi.co/api/v2/pokemon-species/${indexNum}/`
  //   );
  // }

  getEggs() {
    return this.http.get(`${this.urlTemplate}egg-group/`);
  }

  getTypes() {
    return this.http.get(`${this.urlTemplate}type/`);
  }

  getColors() {
    return this.http.get(`${this.urlTemplate}pokemon-color/`);
  }
}
